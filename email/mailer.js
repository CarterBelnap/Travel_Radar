const nodemailer = require('nodemailer');
require('dotenv').config();

// Creates the transporter — this is the "mail client" that sends the email
// We configure it once and reuse it
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.me.com',      // iCloud's outgoing mail server
  port: 587,                      // Standard STARTTLS port
  secure: false,                  // false = STARTTLS (upgrades connection automatically)
  auth: {
    user: process.env.EMAIL_USER,          // Your iCloud email address from .env
    pass: process.env.EMAIL_PASS          // App password from .env (not your real password)
  },
    tls: {
    // iCloud's cert chain isn't fully trusted by Node.js by default
    // This tells Node to connect anyway
    rejectUnauthorized: false
  }
});

// Takes a weather description like "broken clouds" and returns a fitting emoji
function getWeatherEmoji(description) {
  const d = description.toLowerCase();
  if (d.includes('clear')) return '☀️';
  if (d.includes('cloud')) return '⛅';
  if (d.includes('rain')) return '🌧️';
  if (d.includes('snow')) return '❄️';
  if (d.includes('storm')) return '⛈️';
  if (d.includes('fog') || d.includes('mist')) return '🌫️';
  return '🌡️';                             // Fallback if nothing matches
}

// Builds the full HTML email body from the cities data array
function buildEmailHTML(cities) {

  // Get today's date formatted nicely for the email header
  const date = new Date().toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Build an HTML block for each city and join them together
  const cityBlocks = cities.map(city => {

    // Build the news list — map each article to an HTML list item with a link
    const newsItems = city.news
      .map(article => `
        <li style="margin-bottom: 6px;">
          <a href="${article.url}" style="color: #2563eb; text-decoration: none;">
            ${article.title}
          </a>
          <span style="color: #6b7280; font-size: 12px;"> — ${article.source}</span>
        </li>`)
      .join('');

    return `
      <div style="
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
      ">
        <!-- City header -->
        <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #111827;">
          ${city.flag} ${city.name}, ${city.country}
        </h2>

        <!-- Stats row -->
        <div style="
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          padding: 12px;
          background: #000000;
          border-radius: 8px;
        ">
          <span>${getWeatherEmoji(city.weather.description)} 
            <strong>${city.weather.temp}°C</strong> — ${city.weather.description}
            (feels like ${city.weather.feelsLike}°C)
          </span>
          <span>💧 Humidity: <strong>${city.weather.humidity}%</strong></span>
          <span>💸 Est. cost: <strong>~$${city.dailyCostCAD} CAD/day</strong></span>
          <span>💱 1 ${city.exchange.currencyCode} = 
            <strong>$${city.exchange.rateForeignToCAD} CAD</strong>
          </span>
        </div>

        <!-- News section -->
        <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #374151;">📰 Latest Headlines</h3>
        <ul style="margin: 0; padding-left: 20px; color: #374151;">
          ${newsItems}
        </ul>
      </div>`;
  }).join('');

  // Wrap all city blocks in the outer email shell
  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 680px;
      margin: 0 auto;
      padding: 24px;
      background: #f3f4f6;
    ">
      <!-- Header -->
      <div style="
        background: #1d4ed8;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
        text-align: center;
      ">
        <h1 style="margin: 0; color: #ffffff; font-size: 26px;">🌍 Travel Radar</h1>
        <p style="margin: 8px 0 0 0; color: #bfdbfe; font-size: 14px;">${date}</p>
      </div>

      <!-- City blocks -->
      ${cityBlocks}

      <!-- Footer -->
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 8px;">
        Built with Node.js • Data from OpenWeatherMap, NewsAPI & ExchangeRate-API
      </p>
    </div>`;
}

// The main send function — takes the cities data and fires the email
async function sendTravelEmail(cities) {
  const html = buildEmailHTML(cities);

  const mailOptions = {
    from: process.env.EMAIL_USER,          // Sender address
    to: process.env.TO_EMAIL,             // Recipient — can be the same address
    subject: `🌍 Travel Radar — ${new Date().toLocaleDateString('en-CA')}`,
    html                                   // The HTML we just built
  };

  // sendMail does the actual sending — await it so we know if it succeeded
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
}

module.exports = { sendTravelEmail };