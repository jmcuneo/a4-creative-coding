const express = require('express');
const path = require('path');
const app = express();

const buildDirectory = path.join(__dirname, 'dist');
app.use(express.static(buildDirectory));

const modelsDirectory = path.join(__dirname, 'models');
app.use('/public', express.static(modelsDirectory));

app.get('*', function (req, res) {
    res.sendFile(path.join(buildDirectory, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});