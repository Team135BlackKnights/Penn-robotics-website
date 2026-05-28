# Analysis guide

## General approach
1. Identify the page and script involved.
2. Check the API call in the browser network tab.
3. Inspect API behavior through the admin tools and server logs.

## Announcements flow
- List page: [Frontend/announcements.html](Frontend/announcements.html) plus [Frontend/announcements/postscontent.js](Frontend/announcements/postscontent.js) calls /get-posts.
- Single post: [Frontend/announcements/post.html](Frontend/announcements/post.html) plus [Frontend/announcements/post/onepostcontent.js](Frontend/announcements/post/onepostcontent.js) calls /get-post/<id>.
- Admin writes: [Frontend/admin/app.js](Frontend/admin/app.js) calls /make-post, /edit-post, and /delete.

## Image slot flow
- HTML elements include data-image-slot keys.
- [Frontend/image-slot-loader.js](Frontend/image-slot-loader.js) fetches metadata from /image-keys and URLs from /get-image.
- [Backend/api/image_keys.json](Backend/api/image_keys.json) defines allowed types and defaults; [Backend/api/api.py](Backend/api/api.py) stores uploads and mappings.

## Login and admin
- [Frontend/login.html](Frontend/login.html) plus [Frontend/login/login.js](Frontend/login/login.js) calls /login.
- [Frontend/admin.html](Frontend/admin.html) checks /check-login before loading [Frontend/admin/app.js](Frontend/admin/app.js).
- Session expiry and cookie settings live in [Backend/api/api.py](Backend/api/api.py).

## Upload issues
- /upload-image enforces allowed types and max size from [Backend/api/image_keys.json](Backend/api/image_keys.json).
- Pillow compression in [Backend/api/api.py](Backend/api/api.py) can change output format.

## Common gotchas
- [Frontend/index.html](Frontend/index.html) is the primary home page; [Frontend/landing.html](Frontend/landing.html) is an older alternate.
- Never deploy backend code to Cloudflare; see [Backend/api/README.md](Backend/api/README.md).
