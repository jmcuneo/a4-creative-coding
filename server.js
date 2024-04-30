// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Define route to serve HTML page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Define route to fetch data from World Bank API
app.get('/data', async (req, res) => {
  try {
    const response = await fetch('https://api.worldbank.org/v2/countries/USA/indicators/NY.GDP.MKTP.CD?per_page=5000&format=json');
    const data = await response.json();
    // Extract relevant data points
    const gdpData = data[1].map(d => ({ year: d.date, value: d.value }));
    res.json(gdpData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
