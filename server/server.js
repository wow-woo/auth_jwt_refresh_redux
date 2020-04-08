const express = require("express");
const app = express();
const bakeCookie = require("cookie-parser");
const connectDB = require("./database/connectDB");
const cors = require("cors");
require("dotenv").config({ path: "./config/config.env" });

//connect DB
connectDB();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(bakeCookie());
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/api/auth", require("./routes/authRoute"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("server running " + PORT));
