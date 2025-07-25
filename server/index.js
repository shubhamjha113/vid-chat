const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://vid-chat-three.vercel.app'],
  methods: ['GET'],
  allowedHeaders: ['Content-Type'],
}));

app.get('/api/suggestions', async (req, res) => {
  const query = req.query.q;
  try {
    const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${query}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
