require('dotenv').config();

const { getWeather } = require('./apis/weather');
const { getExchangeRate } = require('./apis/exchange');
const { getNews } = require('./apis/news');
const { sendTravelEmail } = require('./email/mailer');

const cities = require('./config/cities.json');

async function buildTravelReport() {
  const results = [];

  for (const city of cities) {
    console.log(`Fetching data for ${city.name}...`);

    const [weather, exchange, news] = await Promise.all([
      getWeather(city.weatherCity),
      getExchangeRate(city.currency),
      getNews(city.newsQuery)
    ]);

    results.push({
      name: city.name,
      country: city.country,
      flag: city.flag,
      dailyCostCAD: city.dailyCostCAD,
      weather,
      exchange,
      news
    });
  }

  console.log('All data fetched, sending email...');
  await sendTravelEmail(results);
  console.log('Done!');
}

buildTravelReport();