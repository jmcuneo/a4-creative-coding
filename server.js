const express = require('express');
const app = express();
const dotenv = require("dotenv").config();

// Define the port
const port = process.env.PORT || 3000; // Use process.env.PORT or default to 3000 if not specified in the environment variables

app.set("view engine", "ejs");
app.get("/", (req, res) => {
    res.render("index");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
