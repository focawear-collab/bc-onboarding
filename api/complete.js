export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const NOTION_KEY = process.env.NOTION_API_KEY;
  const DB_ID = process.env.NOTION_DB_ID;

  if (!NOTION_KEY || !DB_ID) {
    return res.status(500).json({ error: 'Notion not configured' });
  }

  try {
    const { nombre, puntaje, videosVistos, documentoLeido, estado } = req.body;

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: DB_ID },
        properties: {
          'Nombre': { title: [{ text: { content: nombre } }] },
          'Estado': { select: { name: estado } },
          'Puntaje Quiz': { number: puntaje },
          'Videos Vistos': { number: videosVistos },
          'Documento Le\u00eddo': { checkbox: documentoLeido },
          'Fecha Completado': { date: { start: new Date().toISOString().split('T')[0] } }
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.message || 'Notion API error' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
