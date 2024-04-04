const port = process.env.PORT || 3000;
const express = require('express');
const app = express();
app.use(express.static('public'));

app.get('/', (req, res) => {
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});