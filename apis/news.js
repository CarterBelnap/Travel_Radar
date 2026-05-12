const axios = require('axios');
require('dotenv').config();

// Takes a search query like "Tokyo Japan" and returns the top 3 headlines
async function getNews(query) {

  const url = `https://newsapi.org/v2/everything`;

  const response = await axios.get(url, {
    params: {
      q: query,                              // Search term — comes from cities.json newsQuery field
      language: 'en',                        // English articles only
      sortBy: 'publishedAt',                 // Most recent first
      pageSize: 3,                           // We only want 3 headlines per city
      apiKey: process.env.NEWS_API_KEY       // NewsAPI uses apiKey as the param name, not appid
    }
  });

  // response.data.articles is an array of article objects
  // We map over them and pull out only what we need for the email
  const articles = response.data.articles.map(article => ({
    title: article.title,           // Headline text
    source: article.source.name,    // e.g. "BBC News", "Reuters"
    url: article.url                // Link to the full article
  }));

  return articles;
}

module.exports = { getNews };