// Mellomstasjon for Portefølje-appen (Cloudflare Worker).
// Videresender bare til EODHD og Norges Bank, og bare for appen din.
const ALLOW_ORIGIN = 'https://jorq-spec.github.io';
const HOSTS = { eodhd: 'https://eodhd.com', nb: 'https://data.norges-bank.no' };
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
    if (!HOSTS[svc]) return new Response('Mellomstasjonen virker.', { status: 200, headers: cors });
    const r = await fetch(HOSTS[svc] + '/' + rest.join('/') + url.search, {
      headers: { 'User-Agent': 'portefolje-app' },
      cf: { cacheTtl: 1800, cacheEverything: true },
    });
    const h = new Headers(r.headers);
    for (const [k, v] of Object.entries(cors)) h.set(k, v);
    return new Response(r.body, { status: r.status, headers: h });
  },
};
