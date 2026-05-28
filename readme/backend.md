# Backend deep dive

## Entry point and app setup
The Flask app is created in [Backend/api/api.py](Backend/api/api.py) with:
- CORS restricted to trusted origins.
- Session cookies configured for cross-subdomain use (api.pennrobotics.org to pennrobotics.org).
- A per-request origin check for mutating methods.

## Auth and sessions
- Login is username/password based and stored in a session cookie.
- Credentials are configured on the VM in [Backend/api/auth.py](Backend/api/auth.py).
- Sessions expire after 30 minutes of inactivity.

## Data storage
All data is stored locally on the VM in the backend folder:
- SQLite tables are created in [Backend/api/databaseMain.py](Backend/api/databaseMain.py).
- Uploaded images are stored on disk under the backend uploads folder and referenced in the database.

### Tables created in databaseMain.py
- posts_content: announcement posts (title, date, content, author, footer, image, file, video).
- settings: key/value settings store.
- images: mapping from image slot key to filename, mime, uploaded_at, version.

## Image slot system
The dynamic image system lets admins swap images without editing HTML.

- Metadata keys live in [Backend/api/image_keys.json](Backend/api/image_keys.json).
- The API exposes keys at /image-keys and current images at /get-image.
- Uploads are validated for size and mime type, then compressed with Pillow before saving.

Front-end integration is in [Frontend/image-slot-loader.js](Frontend/image-slot-loader.js) and the admin UI in [Frontend/admin/app.js](Frontend/admin/app.js).

## Announcements system
Announcements are stored in SQLite and rendered by the frontend.

- API endpoints in [Backend/api/api.py](Backend/api/api.py) handle CRUD.
- Frontend renders lists via [Frontend/announcements/postscontent.js](Frontend/announcements/postscontent.js).
- Single posts are rendered via [Frontend/announcements/post/onepostcontent.js](Frontend/announcements/post/onepostcontent.js).

## Running locally
- Run the API from Backend/api with your Python environment and Flask dependencies from [Backend/api/requirements.txt](Backend/api/requirements.txt).
- The server listens on port 5000 and is accessed at http://127.0.0.1:5000.
- The frontend JS auto-detects localhost and will call the local API when loaded from a local dev server.
