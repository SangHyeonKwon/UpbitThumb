// Vercel Function: Proxy USD->KRW rate to bypass browser CORS
export default async function handler(req, res) {
    try {
        const upstreamUrl = 'https://api.exchangerate.host/latest?base=USD&symbols=KRW';
        const response = await fetch(upstreamUrl, { 
            headers: { 'Accept': 'application/json' } 
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Exchange rate API error' });
        }
        
        const data = await response.json();
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(data);
    } catch (error) {
        console.error('Rate proxy error:', error);
        res.status(500).json({ error: String(error) });
    }
}
