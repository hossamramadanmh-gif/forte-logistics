export default async function handler(req, res) {
  const key = process.env.DATALASTIC_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'DATALASTIC_API_KEY is not configured' });
  }

  const { query, type = 'vessel' } = req.query || {};
  const value = String(query || '').trim();
  if (!value) return res.status(400).json({ error: 'Missing vessel identifier' });

  // Datalastic documents live vessel_pro lookups by IMO, MMSI, or UUID.
  const params = new URLSearchParams({ 'api-key': key });
  if (type === 'imo' || /^\d{7}$/.test(value)) params.set('imo', value);
  else if (type === 'mmsi' || /^\d{9}$/.test(value)) params.set('mmsi', value);
  else if (type === 'uuid') params.set('uuid', value);
  else return res.status(400).json({ error: 'Use a valid IMO, MMSI, or UUID for live lookup' });

  try {
    const upstream = await fetch(`https://api.datalastic.com/api/v0/vessel_pro?${params.toString()}`);
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: 'Unable to reach Datalastic', detail: error.message });
  }
}
