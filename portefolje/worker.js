// Mellomstasjon for Portefølje-appen (Cloudflare Worker) – v2
// Videresender bare til EODHD, Yahoo Finance og Norges Bank, og bare for appen din.
const ALLOW_ORIGIN = 'https://jorq-spec.github.io';
const HOSTS = {
  eodhd: 'https://eodhd.com',
  nb: 'https://data.norges-bank.no',
  yahoo: 'https://query1.finance.yahoo.com',
  yahoo2: 'https://query2.finance.yahoo.com',
};
const cors = {
  'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};
export default {
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const origin = req.headers.get('Origin');
    if (origin && origin !== ALLOW_ORIGIN) return new Response('Ikke tillatt', { status: 403 });
    const url = new URL(req.url);
    const [, svc, ...rest] = url.pathname.split('/');
    if (!HOSTS[svc]) return new Response('Mellomstasjonen virker. v2', { status: 200, headers: cors });
    const ua = svc.startsWith('yahoo')
      ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
      : 'portefolje-app';
    const r = await fetch(HOSTS[svc] + '/' + rest.join('/') + url.search, {
      headers: { 'User-Agent': ua, 'Accept': 'application/json,text/plain,*/*' },
      cf: { cacheTtl: 1800, cacheEverything: true },
    });
    const h = new Headers(r.headers);
    for (const [k, v] of Object.entries(cors)) h.set(k, v);
    h.delete('set-cookie');
    return new Response(r.body, { status: r.status, headers: h });
  },
};
