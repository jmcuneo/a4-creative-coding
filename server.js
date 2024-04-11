const express = require('express');
const path = require("path");
const app = express();
const dotenv = require("dotenv").config();

// Define the port
const port = process.env.PORT || 3000; // Use process.env.PORT or default to 3000 if not specified in the environment variables


app. use(express. static('public'));
app.get("/", (req, res) => {
    const htmlFile = path.join(__dirname, './public/html/index.html');
    res.sendFile(htmlFile)
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
