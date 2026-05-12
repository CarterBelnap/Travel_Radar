// Pull in the axios library for making HTTP requests
// Think of axios like a browser in code form — it can fetch URLs and return the response
const axios = require('axios');

// dotenv reads your .env file and loads the variables into process.env
// Without this line, process.env.OPENWEATHER_API_KEY would be undefined
require('dotenv').config();

// async means this function will do something that takes time (a network request)
// We use async/await so we can write it in a clean top-to-bottom style
// instead of messy nested callbacks
async function getWeather(cityName) {

  // This is the base URL for the OpenWeatherMap current weather endpoint
  // We'll attach our parameters separately below — axios handles combining them
  const url = `https://api.openweathermap.org/data/2.5/weather`;

  // axios.get() sends a GET request to the URL above
  // The second argument is a config object — params become query string parameters
  // So this actually calls: /weather?q=Tokyo&appid=YOUR_KEY&units=metric
  const response = await axios.get(url, {
    params: {
      q: cityName,                                  // The city name passed into this function
      appid: process.env.OPENWEATHER_API_KEY,       // API key pulled from .env — never hardcoded
      units: 'metric'                               // Celsius — 'imperial' would give Fahrenheit
    }
  });

  // The actual data we care about lives inside response.data
  // OpenWeatherMap returns a large JSON object — we store it here for readability
  const data = response.data;

  // Instead of returning the entire raw response (which has tons of stuff we don't need),
  // we pick out only the fields we'll actually use in the email
  // Math.round() cleans up decimals like 18.74 → 19
  return {
    temp: Math.round(data.main.temp),              // Current temperature in Celsius
    feelsLike: Math.round(data.main.feels_like),   // Feels like temperature
    description: data.weather[0].description,       // e.g. "light rain", "clear sky"
    humidity: data.main.humidity                    // Humidity percentage
  };
}

// Export this function so other files (like index.js) can import and use it
// This is Node's module system — each file is its own isolated module
module.exports = { getWeather };