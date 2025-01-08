const mongoose = require("mongoose");
require('dotenv').config();
const mongoURL = process.env.DATABASE_URL;

const connectToMongo = () =>{
    mongoose.connect(mongoURL)
    .then(() =>{ 
        console.log("Connected to Mongo Successfully");
    })
    .catch((error) =>{
        console.log("Failed to Connect: "+(error));
    });
}
module.exports = connectToMongo;