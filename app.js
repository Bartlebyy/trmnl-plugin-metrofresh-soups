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

function formatSoups(soups) {
  if (!soups?.length) return { soups: [] };
  return {
    soups: soups
      .filter(s => !s.hide && s.title)
      .map(s => ({
        title:        s.title,
        description:  s.description?.trim() || null,
        dietaryInfo:  buildDietaryInfo(s),
      })),
  };
}

app.get('/data', async (_req, res) => {
  try {
    const today = new Date()
      .toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');

    const url =
      `${MENUAT_URL}?keys=[[\"soups\",\"metrofreshoriginal\"]]` +
      `&sort=order&format=json&template=raw&date=${today}`;

    const { data } = await axios.get(url);
    res.json(formatSoups(data));
  } catch (err) {
    console.error('Error fetching soups:', err);
    res.status(500).json({ error: 'Error fetching soups' });
  }
});

module.exports = app;          // <-- EXPORT *only* the Express instance
