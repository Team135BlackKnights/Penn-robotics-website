# Ops and deployment

## Deployment boundaries
- Frontend deploys to Cloudflare Pages.
- Backend deploys to the Hostinger VM only. See [Backend/api/README.md](Backend/api/README.md).

## Backend update process
- The VM update script and process are described in [Backend/api/updateVPS.md](Backend/api/updateVPS.md).
- The script pulls from GitHub main and replaces [Backend/api/api.py](Backend/api/api.py), [Backend/api/databaseMain.py](Backend/api/databaseMain.py), [Backend/api/image_keys.json](Backend/api/image_keys.json), and [Backend/api/installflask.py](Backend/api/installflask.py).

## Backend dependencies
- Python packages are listed in [Backend/api/requirements.txt](Backend/api/requirements.txt).
- [Backend/api/installflask.py](Backend/api/installflask.py) can install the required packages.

## Local dev notes
- Frontend: use a static dev server (Live Server is recommended in [Frontend/README.md](Frontend/README.md)).
- Backend: run [Backend/api/api.py](Backend/api/api.py) and access the API on http://127.0.0.1:5000.
- Frontend JS auto-detects localhost and will call the local API when running from a local server.

## Analytics and services
- PostHog is included via script tags on several pages; see details in [Frontend/README.md](Frontend/README.md).
