const puppeteer = require("puppeteer");
const axios = require("axios");
const Trend = require("./trendSchema");
require('dotenv').config();
const API_KEY = process.env.SCRAPER_API; // Your ScraperAPI key
const TARGET_URL = "https://httpbin.org/ip"; // Test endpoint to check IP

// ScraperAPI function to get proxy IP
async function getProxyIP() {
  try {
    const response = await axios.get("https://api.scraperapi.com", {
      params: {
        api_key: API_KEY,
        url: TARGET_URL,
      },
    });
    return response.data.origin; // Return proxy IP address used
  } catch (error) {
    console.error("Error fetching proxy IP:", error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to perform login and scrape content
async function loginAndScrapeContent() {
  const browser = await puppeteer.launch({
    headless: true, // Visible browser for interaction
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  let trendingHeadlines = [];
  let ipAddress = "";

  try {
    console.log("Fetching page content via ScraperAPI...");
    await page.goto(`https://x.com/login`, {
      waitUntil: "domcontentloaded",
    });

    console.log("Entering Username...");
    await page.waitForSelector('input[name="text"]', { timeout: 30000 });
    await page.type('input[name="text"]', process.env.TWITTER_USERNAME, { delay: 100 });
    await page.keyboard.press("Enter");

    console.log("Checking for email field...");
    const isEmailFieldVisible = await page
      .waitForSelector('input[name="text"]', { timeout: 5000 }) // Same selector for email
      .then(() => true)
      .catch(() => false);
      if (isEmailFieldVisible) {
        console.log("Entering email...");
        await page.type('input[name="text"]', process.env.TWITTER_EMAIL, { delay: 100 });
        await page.keyboard.press("Enter");
      }

    console.log("Waiting for password input...");
    await page.waitForSelector('input[name="password"]', { timeout: 30000 });
    await page.type('input[name="password"]', process.env.TWITTER_PASSWORD, { delay: 100 });
    await page.keyboard.press("Enter");

    console.log("Waiting for home page...");
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector('a[aria-label="Home"]', { timeout: 30000 });

    console.log("Login successful! Navigating to the home page...");

    trendingHeadlines = await page.evaluate(() => {
      const trendingSection = document.querySelector('section[aria-labelledby="accessible-list-1"]');
      if (!trendingSection) return [];
      const headlines = Array.from(trendingSection.querySelectorAll('div[role="link"]'));
      return headlines.slice(0, 5).map((el) => el.textContent.trim());
    });

    console.log("Top 5 Trending Headlines:");
    trendingHeadlines.forEach((headline, index) => console.log(`${index + 1}. ${headline}`));

    ipAddress = await getProxyIP();

    // Save the scraped data into MongoDB
    const newTrend = new Trend({
      trend1: trendingHeadlines[0],
      trend2: trendingHeadlines[1],
      trend3: trendingHeadlines[2],
      trend4: trendingHeadlines[3],
      trend5: trendingHeadlines[4],
      ipAddress: ipAddress,
    });

    await newTrend.save();
    console.log("Trend data saved to MongoDB");

  } catch (error) {
    console.error("An error occurred during scraping:", error.message);
  } finally {
    await browser.close();
  }

  return trendingHeadlines;
}

// Expose scraper functions
module.exports = {
  getProxyIP,
  loginAndScrapeContent,
};
