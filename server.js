const express = require("express"),
    app = express(),
    path = require('path');

require('dotenv').config();

app.use(express.static(path.join(__dirname, 'public')) )
app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(3000)