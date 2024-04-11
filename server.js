const express = require('express');
const app = express();
const path = require('path');

app.use(express.json() );
app.use(express.static("public") );

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/')
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
