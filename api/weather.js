// Vercel serverless function for proxying request to visual crossing weather API

const API_KEY = process.env.VITE_API_KEY;

export default async function handler(req, res) {
  const { lat, long } = req.query;

  if (!lat || !long) {
    return res.status(400).json({ error: 'Missing lat or long' });
  }

  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${long}/today?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from Visual Crossing:', error);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
}
