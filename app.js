// app.js  – plain Express app, exported for both local + serverless
const express = require('express');
const axios   = require('axios');

const app = express();
const MENUAT_URL = 'https://menuat.com/query';

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

function buildDietaryInfo(s) {
  const info = [];
  if (s.glutenfree) info.push('GF');
  if (s.vegetarian) info.push('V');
  if (s.vegan)      info.push('VG');
  if (s.dairy)      info.push('DF');
  if (s.egg)        info.push('EF');
  if (s.nuts)       info.push('NF');
  return info;
}

function cleanHtml(html) {
  if (!html) return null;
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatItems(items, type) {
  if (!items?.length) return { [type]: [] };
  return {
    [type]: items
      .filter(s => !s.hide && s.title)
      .map(s => ({
        title:        s.title,
        description:  cleanHtml(s.description),
        dietaryInfo:  buildDietaryInfo(s),
      })),
  };
}

app.get('/data', async (_req, res) => {
  try {
    const today = new Date()
      .toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');

    const [soupsResponse, sandwichesResponse] = await Promise.all([
      axios.get(`${MENUAT_URL}?keys=[[\"soups\",\"metrofreshoriginal\"]]&sort=order&format=json&template=raw&date=${today}`),
      axios.get(`${MENUAT_URL}?keys=[[\"sandwiches\",\"metrofreshoriginal\"]]&sort=order&format=json&template=raw&date=${today}`)
    ]);

    const formattedSoups = formatItems(soupsResponse.data, 'soups');
    const formattedSandwiches = formatItems(sandwichesResponse.data, 'sandwiches');

    res.json({
      ...formattedSoups,
      ...formattedSandwiches
    });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({ error: 'Error fetching menu items' });
  }
});

module.exports = app;          // <-- EXPORT *only* the Express instance
