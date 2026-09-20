<div align="center">
  <img src="assets/invidious-colored-vector.svg" width="128" height="128" alt="Invidious logo">
  <h1>Invidious</h1>
  <h3>An open source alternative front-end to YouTube (Worker Edition)</h3>
</div>

## Overview

Invidious is an alternative, privacy-respecting front-end to YouTube. In this version, the server has been restructured into a universal **Web Standards / Cloudflare Worker (`worker.ts`)** handling standard `Request` & `Response` objects, with a lightweight Node adapter (`server.ts`) for local development and container hosting.

## Architecture

- **Server Backend (`worker.ts`)**: Pure Web Standards Edge Worker handler (`export default { fetch(request, env) }`). Compatible with **Cloudflare Workers**, Vercel Edge, Deno, and Bun.
- **Node Adapter (`server.ts`)**: Bridges local Node HTTP / Vite development on port 3000 to the Worker's `fetch()` pipeline.
- **Frontend (`src/`)**: React 18 + Vite + Tailwind CSS with dark, OLED, and light theme customization.
- **Worker Configuration (`wrangler.toml`)**: Ready for direct deployment to Cloudflare Workers with static asset binding.

## Features

- **Privacy-Friendly Playback**: Watch videos without ad trackers, telemetry, or Google tracking cookies using the embedded Nocookie player or native HTML5 stream player.
- **Feeds**: Browse Trending videos (General, Music, Gaming, News, Movies) and Popular videos.
- **Search**: Fast video and channel search with instant query autocomplete suggestions and customizable filters (Sort by relevance, rating, upload date, view count).
- **Video Details & Comments**: High-definition video player with speed and quality controls, expandable descriptions, like counts, and full comment threads.
- **Channels**: Channel pages with banners, subscriber stats, about info, and recent video listings.
- **Local Persistence**: Subscriptions, watch history, and custom playlists are preserved locally in your browser.
- **Customization & Themes**: Toggle between Dark theme, OLED black, and Light theme, plus thin/compact list mode.
- **Invidious API v1**: Compatible endpoints including `/api/v1/trending`, `/api/v1/popular`, `/api/v1/search`, `/api/v1/videos/:id`, `/api/v1/channels/:id`, and `/api/v1/stats`.

## Running & Building

### Local Development (Node + Vite)
```bash
npm install
npm run dev
```
Runs the application on port `3000` (`http://0.0.0.0:3000`).

### Build Standalone Worker
```bash
npm run build:worker
```
Bundles `worker.ts` into a standalone, lightweight ES module in `dist/worker.js`.

### Deploy to Cloudflare Workers
```bash
npx wrangler deploy
```
