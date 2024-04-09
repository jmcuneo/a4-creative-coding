const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let gameSettings = {
    width: 5,
    height: 5,
    color: "#abcdef",
    tickSpeed: 1000
};

app.use(express.static('public'));

app.get('/settings', (req, res) => {
    res.json(gameSettings);
});

app.post('/settings', (req, res) => {
    const { width, height, color, tickSpeed } = req.body;
    gameSettings = { width, height, color, tickSpeed };
    res.json({ message: "Settings updated successfully." });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
