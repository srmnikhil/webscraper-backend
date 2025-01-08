const express = require('express');
const connectToMongo = require("./db");
const cors = require('cors');
const { getProxyIP, loginAndScrapeContent } = require('./scraper');
connectToMongo();

const app = express();

app.use(cors());
app.use(express.json());

// Route to trigger scraper
app.get("/run-scraper", async (req, res) => {
  try {
    console.log("Checking the proxy IP via ScraperAPI...");
    const proxyIP = await getProxyIP();

    if (proxyIP) {
      console.log("Proxy IP:", proxyIP);
      console.log("Fetching page content and logging in...");
      const trendingHeadlines = await loginAndScrapeContent();
      res.json({
        message: "Scraper finished running!",
        proxyIP,
        trendingHeadlines,
      });
    } else {
      res.status(500).json({
        message: "Failed to fetch proxy IP.",
      });
    }
  } catch (error) {
    console.error("Error running scraper:", error.message);
    res.status(500).json({ message: "Error running scraper", error: error.message });
  }
});

app.get('/start', async (req, res) => {
  try {
    res.json("Backend is Ready."); // Return the first (most recent) trend data
  } catch (error) {
    res.status(500).json({ message: "Error fetching trend data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
