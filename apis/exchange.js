// axios for HTTP requests, dotenv to access our API key from .env
const axios = require('axios');
require('dotenv').config();

// Takes a currency code like 'JPY', 'ISK', or 'EUR'
// Returns how much 1 unit of that currency is worth in CAD
async function getExchangeRate(currencyCode) {

  // ExchangeRate-API structure: /v6/YOUR_KEY/latest/BASE_CURRENCY
  // We use CAD as the base so all rates come back relative to 1 CAD
  const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_API_KEY}/latest/CAD`;

  const response = await axios.get(url);

  // response.data.conversion_rates is an object of all currencies
  // e.g. { JPY: 109.5, EUR: 0.68, ISK: 150.2, ... }
  const rates = response.data.conversion_rates;

  // Pull out just the rate for the currency we asked for
  // This tells us: 1 CAD = X of that currency
  const rateCADtoForeign = rates[currencyCode];

  // Flip it so we know: 1 foreign unit = X CAD (more intuitive for travellers)
  const rateForeignToCAD = (1 / rateCADtoForeign).toFixed(4);

  return {
    currencyCode,                          // e.g. 'JPY'
    rateForeignToCAD                       // e.g. 0.0091 means 1 JPY = $0.0091 CAD
  };
}

module.exports = { getExchangeRate };