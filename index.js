const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const MENUAT_URL = "https://menuat.com/query";

/**
 * Example JSON Response:
 * {
 *   "soups": [
 *     {
 *       "title": "Tomato Basil Soup",
 *       "description": "Classic tomato soup with fresh basil",
 *       "dietaryInfo": ["V", "GF"]
 *     },
 *     {
 *       "title": "Lentil Vegetable",
 *       "description": "Hearty lentil soup with seasonal vegetables",
 *       "dietaryInfo": ["V", "VG", "GF"]
 *     }
 *   ]
 * }
 */

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Helper function to build dietary info
const buildDietaryInfo = (soup) => {
  const info = [];
  if (soup.glutenfree) info.push("GF");
  if (soup.vegetarian) info.push("V");
  if (soup.vegan) info.push("VG");
  if (soup.dairy) info.push("DF");
  if (soup.egg) info.push("EF");
  if (soup.nuts) info.push("NF");
  return info;
};

// Helper function to format soups
const formatSoups = (soups) => {
  if (!soups || soups.length === 0) {
    return { soups: [] };
  }

  const soupItems = soups
    .filter(soup => !soup.hide && soup.title)
    .map(soup => ({
      title: soup.title,
      description: soup.description?.trim() || null,
      dietaryInfo: buildDietaryInfo(soup)
    }));

  return { soups: soupItems };
};

// Endpoint to fetch soups
app.get('/data', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');

    const url = `${MENUAT_URL}?keys=[[%22soups%22,%22metrofreshuptown%22]]&sort=order&format=json&template=raw&date=${today}`;
    
    const response = await axios.get(url);
    const formattedSoups = formatSoups(response.data);
    
    res.json(formattedSoups);
  } catch (error) {
    console.error('Error fetching soups:', error);
    res.status(500).json({ error: 'Error fetching soups' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
