# Architecture

## System overview
The site is split into a static frontend and a Flask backend API.

- Frontend: static HTML/SCSS/JS in the Frontend folder, deployed to Cloudflare Pages.
- Backend: Flask API in the Backend/api folder, deployed to the Hostinger VM.
- Data: announcements and image slots are stored in SQLite and on disk in the backend folder.

## Runtime flow
1. Browser loads HTML, CSS, and JS from the frontend deployment.
2. The frontend fetches announcements and image slots from the API.
3. The admin page logs in, then writes posts and image uploads to the API.

## Key backend components
- API app and route wiring: [Backend/api/api.py](Backend/api/api.py)
- Auth constants (set on the VM): [Backend/api/auth.py](Backend/api/auth.py)
- Database layer: [Backend/api/databaseMain.py](Backend/api/databaseMain.py)
- Legacy API (older behavior): [Backend/api/legacyapi.py](Backend/api/legacyapi.py)
- Image slot metadata: [Backend/api/image_keys.json](Backend/api/image_keys.json)

## Trust boundaries and security
- Backend code must never be deployed to Cloudflare. See [Backend/api/README.md](Backend/api/README.md).
- Mutating requests (POST, PUT, PATCH, DELETE) are blocked unless the Origin is trusted and a session cookie is present. See [Backend/api/api.py](Backend/api/api.py).
