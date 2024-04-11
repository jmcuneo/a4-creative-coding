const express = require("express"),
    app = express(),
    cors = require('cors');

app.use(express.static('public'))
app.use(express.json())
app.use( cors() )

app.get('/', (req, res) => {
    res.sendFile('index.html');
});


app.listen(3000)