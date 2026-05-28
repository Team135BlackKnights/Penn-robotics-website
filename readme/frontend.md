# Frontend deep dive

## Overview
The frontend is a static HTML/SCSS/JS site. Each page lives as an HTML file with page-specific SCSS and compiled CSS in a matching folder.

Shared styling is defined in:
- [Frontend/_variables.scss](Frontend/_variables.scss)
- [Frontend/_navbar.scss](Frontend/_navbar.scss)
- [Frontend/_footer.scss](Frontend/_footer.scss)

## Shared scripts
- [Frontend/hamburger.js](Frontend/hamburger.js): mobile nav toggle.
- [Frontend/accordion.js](Frontend/accordion.js): accordion expand and collapse.
- [Frontend/popup.js](Frontend/popup.js): cookie-based popup banner.
- [Frontend/typed.js](Frontend/typed.js): typed.js configuration.
- [Frontend/swiper.js](Frontend/swiper.js): Swiper slider configuration.
- [Frontend/focus-arrow.js](Frontend/focus-arrow.js): focus arrow overlay for image slots.
- [Frontend/image-slot-loader.js](Frontend/image-slot-loader.js): loads dynamic images by key.
- [Frontend/photoswipe.js](Frontend/photoswipe.js): PhotoSwipe setup and captions.

## Dynamic systems
- Announcements list page: [Frontend/announcements.html](Frontend/announcements.html) uses [Frontend/announcements/postscontent.js](Frontend/announcements/postscontent.js).
- Single announcement page: [Frontend/announcements/post.html](Frontend/announcements/post.html) uses [Frontend/announcements/post/onepostcontent.js](Frontend/announcements/post/onepostcontent.js).
- Missing post fallback: [Frontend/post404.html](Frontend/post404.html) is linked from [Frontend/announcements/post/onepostcontent.js](Frontend/announcements/post/onepostcontent.js).
- Admin dashboard: [Frontend/admin.html](Frontend/admin.html) checks /check-login then loads [Frontend/admin/app.js](Frontend/admin/app.js).
- Login page: [Frontend/login.html](Frontend/login.html) uses [Frontend/login/login.js](Frontend/login/login.js).

## Page map
- [Frontend/index.html](Frontend/index.html): primary home page; styles in [Frontend/landing-page/index.css](Frontend/landing-page/index.css) and [Frontend/landing-page/index.scss](Frontend/landing-page/index.scss); uses [Frontend/typed.js](Frontend/typed.js), [Frontend/swiper.js](Frontend/swiper.js), [Frontend/focus-arrow.js](Frontend/focus-arrow.js), [Frontend/image-slot-loader.js](Frontend/image-slot-loader.js).
- [Frontend/landing.html](Frontend/landing.html): older or alternate home page; still uses [Frontend/landing-page/index.css](Frontend/landing-page/index.css).
- [Frontend/announcements.html](Frontend/announcements.html): announcements list; styles in [Frontend/announcements/announcements.css](Frontend/announcements/announcements.css).
- [Frontend/announcements/post.html](Frontend/announcements/post.html): single announcement view; styles in [Frontend/announcements/post/post.css](Frontend/announcements/post/post.css).
- [Frontend/admin.html](Frontend/admin.html): admin dashboard; styles in [Frontend/admin/admin.css](Frontend/admin/admin.css).
- [Frontend/login.html](Frontend/login.html): admin login page; styles in [Frontend/login/login.css](Frontend/login/login.css).
- [Frontend/contact-us.html](Frontend/contact-us.html): styles in [Frontend/contact-us/contact-us.css](Frontend/contact-us/contact-us.css).
- [Frontend/sponsor-us.html](Frontend/sponsor-us.html): styles in [Frontend/sponsor-us/sponsor-us.css](Frontend/sponsor-us/sponsor-us.css).
- [Frontend/ME.html](Frontend/ME.html): styles in [Frontend/ME/ME.css](Frontend/ME/ME.css).
- [Frontend/outreach.html](Frontend/outreach.html): styles in [Frontend/outreach/outreach.css](Frontend/outreach/outreach.css).
- [Frontend/youth-camps.html](Frontend/youth-camps.html): styles in [Frontend/youth-camps/youth-camps.css](Frontend/youth-camps/youth-camps.css).
- [Frontend/team-135.html](Frontend/team-135.html): styles in [Frontend/team-135/team-135.css](Frontend/team-135/team-135.css).
- [Frontend/team-328.html](Frontend/team-328.html): styles in [Frontend/328-page/team-328.css](Frontend/328-page/team-328.css).
- [Frontend/history.html](Frontend/history.html): styles in [Frontend/history/history.css](Frontend/history/history.css).
- [Frontend/328history.html](Frontend/328history.html): styles in [Frontend/328history/328history.css](Frontend/328history/328history.css).
- [Frontend/subteams.html](Frontend/subteams.html): styles in [Frontend/subteams/subteams.css](Frontend/subteams/subteams.css).
- [Frontend/games.html](Frontend/games.html): styles in [Frontend/games/games.css](Frontend/games/games.css); subpages in [Frontend/games/crescendo.html](Frontend/games/crescendo.html) and [Frontend/games/reefscape.html](Frontend/games/reefscape.html).
- [Frontend/404.html](Frontend/404.html): styles in [Frontend/404/404.css](Frontend/404/404.css).
- [Frontend/sa-pp.html](Frontend/sa-pp.html): styles in [Frontend/sa-pp/sa-pp.css](Frontend/sa-pp/sa-pp.css).

## Vendor libraries
- PhotoSwipe assets live under the Frontend/photoswipe folder and are wired by [Frontend/photoswipe.js](Frontend/photoswipe.js).
- External libraries used by pages are documented in [Frontend/README.md](Frontend/README.md).

## Legacy or alternate assets
- Older landing page assets live in [Frontend/landing-page copy/landing.css](Frontend/landing-page%20copy/landing.css) and [Frontend/landing-page copy/landing.scss](Frontend/landing-page%20copy/landing.scss).
