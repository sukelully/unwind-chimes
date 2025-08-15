export default async function handler(req, res) {
  const { lat, long } = req.query;

  if (!lat || !long) {
    return res.status(400).json({ error: 'Missing lat or long' });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&zoom=10&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'UnwindChimes (luke@sukelully.dev)' },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from Nominatim:', error);
    res.status(500).json({ error: 'Failed to fetch from Nominatim' });
  }
}
