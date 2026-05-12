// Load environment variables from .env first — always the first line
require('dotenv').config();

const { getWeather } = require('./apis/weather');
const { getExchangeRate } = require('./apis/exchange');
const { getNews } = require('./apis/news');

// Load our city list from the config file
// This is why the config-driven approach pays off — one line loads all cities
const cities = require('./config/cities.json');

async function buildTravelReport() {

  // This array will hold the completed data object for each city
  const results = [];

  // Loop through each city in cities.json
  for (const city of cities) {
    console.log(`Fetching data for ${city.name}...`);

    // Fetch all three data points for this city simultaneously
    // Promise.all runs them in parallel instead of waiting for each one to finish
    // before starting the next — much faster
    const [weather, exchange, news] = await Promise.all([
      getWeather(city.weatherCity),
      getExchangeRate(city.currency),
      getNews(city.newsQuery)
    ]);

    // Bundle everything into one clean object for this city
    results.push({
      name: city.name,
      country: city.country,
      flag: city.flag,
      dailyCostCAD: city.dailyCostCAD,   // Read directly from config — no API needed
      weather,
      exchange,
      news
    });
  }

  // Log the full report to verify everything looks right
  console.log(JSON.stringify(results, null, 2));
}

buildTravelReport();