# Backend routes

This catalog lists every route in the current API and the legacy API.

## Current API ([Backend/api/api.py](Backend/api/api.py))

| Method | Path | Auth | Purpose | Implementation |
| --- | --- | --- | --- | --- |
| GET | / | Public | Health check string | [Backend/api/api.py](Backend/api/api.py#L175) |
| GET | /check-login | Public (uses session cookie if present) | Returns logged_in boolean | [Backend/api/api.py](Backend/api/api.py#L178) |
| POST | /login | Public | Creates a session if credentials are valid | [Backend/api/api.py](Backend/api/api.py#L197) |
| POST | /make-post | Session cookie | Create a new announcement post | [Backend/api/api.py](Backend/api/api.py#L212) |
| GET | /get-post/<int:post_id> | Public | Fetch a single post by ID | [Backend/api/api.py](Backend/api/api.py#L236) |
| POST | /edit-post | Session cookie | Edit an existing post | [Backend/api/api.py](Backend/api/api.py#L249) |
| GET | /uploads/<path:filename> | Public | Serve uploaded images | [Backend/api/api.py](Backend/api/api.py#L284) |
| GET | /image-keys | Public | Return image slot metadata | [Backend/api/api.py](Backend/api/api.py#L301) |
| POST | /upload-image | Session cookie | Upload or replace an image slot | [Backend/api/api.py](Backend/api/api.py#L310) |
| GET | /get-image | Public | Resolve an image slot key to a URL | [Backend/api/api.py](Backend/api/api.py#L383) |
| POST | /delete-image | Session cookie | Remove an uploaded image slot mapping | [Backend/api/api.py](Backend/api/api.py#L447) |
| DELETE | /delete/<int:post_id> | Session cookie | Delete a post by ID | [Backend/api/api.py](Backend/api/api.py#L488) |
| GET | /get-posts | Public | Paginated post list (page, limit) | [Backend/api/api.py](Backend/api/api.py#L496) |
| GET | /get-logs | Session cookie | Read API logs | [Backend/api/api.py](Backend/api/api.py#L504) |
| GET | /download-logs | Session cookie | Download API logs | [Backend/api/api.py](Backend/api/api.py#L516) |
| POST | /reset-logs | Session cookie | Clear API logs | [Backend/api/api.py](Backend/api/api.py#L527) |

Notes:
- All POST, PUT, PATCH, and DELETE requests are blocked unless the Origin is trusted and a session cookie is present.
- /image-keys and /get-image are public but CORS-limited to trusted origins.

## Legacy API ([Backend/api/legacyapi.py](Backend/api/legacyapi.py))

| Method | Path | Auth | Purpose | Implementation |
| --- | --- | --- | --- | --- |
| GET | / | Public | Health check string | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L57) |
| GET | /check-login | Public (uses session cookie if present) | Returns logged_in boolean | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L60) |
| POST | /login | Public | Creates a session if credentials are valid | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L72) |
| POST | /make-post | Session cookie | Create a new announcement post | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L86) |
| GET | /get-post/<int:post_id> | Public | Fetch a single post by ID | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L106) |
| POST | /edit-post | Session cookie | Edit an existing post | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L116) |
| GET | /uploads/<path:filename> | Public | Serve uploaded images | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L147) |
| DELETE | /delete/<int:post_id> | Session cookie | Delete a post by ID | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L152) |
| GET | /get-posts | Public | Paginated post list (page, limit) | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L160) |
| GET | /get-logs | Session cookie | Read API logs | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L168) |
| GET | /download-logs | Session cookie | Download API logs | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L180) |
| POST | /reset-logs | Session cookie | Clear API logs | [Backend/api/legacyapi.py](Backend/api/legacyapi.py#L191) |
