import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import worker from './worker';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve assets folder
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

/**
 * Worker Adapter:
 * Routes all `/api/*` requests through the universal Web Standards / Cloudflare Worker handler (`worker.fetch`).
 * This transforms the server runtime into a Worker architecture without altering any client functionalities.
 */
app.all('/api/*', async (req, res) => {
  try {
    const host = req.get('host') || `localhost:${PORT}`;
    const url = `${req.protocol}://${host}${req.originalUrl}`;
    
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const body = hasBody && req.body ? JSON.stringify(req.body) : undefined;

    const webReq = new Request(url, {
      method: req.method,
      headers,
      body,
    });

    const webRes = await worker.fetch(webReq, process.env);

    res.status(webRes.status);
    webRes.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    const buffer = Buffer.from(await webRes.arrayBuffer());
    res.send(buffer);
  } catch (err: any) {
    console.error('Worker request error:', err);
    res.status(500).json({ error: 'Worker runtime error', details: err?.message });
  }
});

/* ==========================================================================
   VITE MIDDLEWARE (DEV) & STATIC FILES (PRODUCTION)
   ========================================================================== */

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Invidious Worker Node Adapter running on http://0.0.0.0:${PORT}`);
  });
}

start();
