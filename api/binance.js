// Vercel Function: Proxy Binance ticker/price to bypass browser CORS
export default async function handler(req, res) {
    try {
        const symbols = req.query.symbols;
        if (!symbols) {
            return res.status(400).json({ error: 'symbols query required' });
        }
        
        const upstreamUrl = `https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(symbols)}`;
        const response = await fetch(upstreamUrl, { 
            headers: { 'Accept': 'application/json' } 
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Binance API error' });
        }
        
        const data = await response.json();
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(data);
    } catch (error) {
        console.error('Binance proxy error:', error);
        res.status(500).json({ error: String(error) });
    }
}
