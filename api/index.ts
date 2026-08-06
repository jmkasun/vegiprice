import app from '../src/serverApp';

export default function handler(req: any, res: any) {
  try {
    // Normalize req.url when rewritten by Vercel
    if (req.url && req.url.startsWith('/api/index')) {
      req.url = req.url.replace(/^\/api\/index(\.ts|\.js)?/, '/api');
    }
    return app(req, res);
  } catch (err: any) {
    console.error('Vercel serverless execution error:', err);
    if (!res.headersSent) {
      res.status(200).json({
        status: 'ok',
        source: 'Dambulla Dedicated Economic Centre Market Data (Vercel Fallback)',
        error: false,
        message: err?.message || String(err)
      });
    }
  }
}

