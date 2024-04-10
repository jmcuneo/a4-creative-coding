const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the Vue app build directory
const buildDirectory = path.join(__dirname, 'dist');
app.use(express.static(buildDirectory));

// Handle every other route with index.html, which will contain
// a script tag to your app's JavaScript file(s).
app.get('*', function (req, res) {
    res.sendFile(path.join(buildDirectory, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});