# Kantipur | Fact Checker - Frontend

This is the user-facing frontend for the Kantipur Fact Checker application.

## Development

```bash
pnpm install
pnpm dev
```

## Production Build

```bash
pnpm build
```

This will generate two entry points in the `dist/` folder:

- `index.html`: The main entry point for the homepage and general SPA routes.
- `news.html`: A specialized template used by the `user-server` for dynamic Open Graph (OG) tag injection.

## Production Reliability Checklist (OG Images)

- Build and deploy `dist/news.html` alongside `dist/index.html`. The `user-server` only reads from `dist/` in production.
- Ensure `/n/:slug` requests are always proxied to `user-server` (not served as static files).
- Make sure `ogImage` or the first `media.url` stored in the DB is a fully qualified URL (e.g. `https://...`). Many crawlers ignore relative OG image URLs.
- Ensure `/og_image.png` exists in `dist/` for the server-side fallback OG image.
- Set `USER_FE_ORIGIN` on the `user-server` to the public HTTPS origin (e.g. `https://factchecker.ekantipur.com`). The first origin is used as the canonical base for OG URLs.
- Serve the site over HTTPS. Some crawlers will not display OG images from insecure origins.

## Nginx Deployment (Recommended)

To support **Dynamic OG Tags** and **SEO Injection**, your Nginx configuration must proxy page requests to the `user-server` while serving static assets directly.

### Recommended Nginx Config

```nginx
server {
    listen 80;
    server_name factchecker.ekantipur.com;

    # 1. Static Assets (JS, CSS, Images, etc.)
    # Serve these directly from the 'dist' folder for maximum performance
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf|json)$ {
        root /var/www/kmg-ai-news/user-fe/dist;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # 2. Dynamic Routing & SPA Support
    # Proxy all other requests to the Hono user-server
    # This allows the server to inject live metadata into news.html
    location / {
        proxy_pass http://localhost:6011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Why this setup?

- **Messaging Apps (WhatsApp/FB)**: When a link is shared, the `user-server` intercepts the request, queries the DB, and injects the dynamic title/image into the `news.html` template.
- **Performance**: Nginx handles the heavy lifting of serving static JS and CSS files directly without hitting the Node.js process.
- **SPA Fallback**: The server is already configured to serve `index.html` for all unknown routes, ensuring your React Router works perfectly on refreshes.

## VPS Setup (Required for Reliable OG)

1. Build the frontend and deploy the `dist/` folder to your VPS.
2. Run `user-server` on the VPS (e.g. systemd or PM2) so it can serve `/n/:slug` with injected OG tags.
3. Set `user-server` environment variables: `PORT=6011` and `USER_FE_ORIGIN=https://factchecker.ekantipur.com`.
4. Point Nginx to `dist/` for static assets and proxy all other paths to `user-server` (see config above).
5. Ensure the `ogImage` field (or first media URL) in your DB is a fully qualified HTTPS URL.
6. Verify `https://factchecker.ekantipur.com/og_image.png` is publicly reachable (used as OG fallback).
