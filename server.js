
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/data', async (req, res) => {
  try {
    const response = await fetch('https://api.worldbank.org/v2/countries/USA/indicators/NY.GDP.MKTP.CD?per_page=5000&format=json');
    const data = await response.json();
    const gdpData = data[1].map(d => ({ year: d.date, value: d.value }));
    res.json(gdpData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(PORT, () => {
  console.log(`Running on port:${PORT}`);
});
