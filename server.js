// const path = require('path');
// const express = require('express');
// const app = express();
const port = 3000;

// // app.get('/', (req, res) => {
// //     res.sendFile()
// // })

// app.use("/", express.static("src"));

// app.listen(port, function () {
//     console.log(`Example app listening on port ${port}!`);
//   });

// 'use strict';

const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

// app.use((req, res) => {
//     res.status(200).send('Hello, world!');
// });

// Start the server
// const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});