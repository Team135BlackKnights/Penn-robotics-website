// image-slot-loader.js
// Loads images for elements that declare `data-image-slot`.
// Optimised: DOMContentLoaded, parallel fetches, browser caching, fade-in.

(function () {
  'use strict';

  const DEFAULT_API_HOST = 'https://api.pennrobotics.org';

  // ── Slot elements start hidden so the CSS default image is never visible
  //    before the dynamic image arrives. A short timeout guarantees fallback
  //    visibility even if the API is unreachable.
  var REVEAL_TIMEOUT_MS = 1200; // max ms to wait before showing default

  function detectBaseUrl() {
    if (window.IMAGE_SLOT_API_BASE) {
      return window.IMAGE_SLOT_API_BASE;
    }
    const host = window.location.hostname || '';
    const port = window.location.port || '';
    if (host === '127.0.0.1' || host === 'localhost' || host === '0.0.0.0' || host.startsWith('192.168.') || port === '5500') {
      return 'http://127.0.0.1:5000';
    }
    return DEFAULT_API_HOST;
  }

  const baseUrl = detectBaseUrl();
  console.debug('image-slot-loader: baseUrl =', baseUrl);

  // ── Inject a tiny style rule so slot elements start invisible and fade in.
  //    This avoids the flash of the CSS-default background before the API
  //    image is applied.
  (function injectHideStyle() {
    var style = document.createElement('style');
    style.textContent =
      '[data-image-slot]{opacity:0;transition:opacity .18s ease}' +
      '[data-image-slot].slot-ready{opacity:1}';
    document.head.appendChild(style);
  })();

  function revealElement(el) {
    if (el && !el.classList.contains('slot-ready')) {
      el.classList.add('slot-ready');
    }
  }

  function applySlotToElement(el, url, applyMode) {
    if (!el || !url) return;
    const tag = (el.tagName || '').toUpperCase();

    if (applyMode === 'src' && tag === 'IMG') {
      el.src = url;
    } else if (tag === 'IMG') {
      el.style.backgroundImage = `url('${url}')`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
    } else {
      const childImages = el.querySelectorAll('img');
      if (childImages.length > 0) {
        childImages[0].src = url;
        for (let i = 1; i < childImages.length; i++) {
          childImages[i].style.display = 'none';
        }
      } else {
        el.style.backgroundImage = `url('${url}')`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
    }

    // Reveal immediately after applying the dynamic image
    revealElement(el);
  }

  function fetchImageForKey(key) {
    const url = `${baseUrl}/get-image?key=${encodeURIComponent(key)}`;
    console.debug('image-slot-loader: fetching', url);
    return fetch(url)                     // let browser cache normally
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .catch(err => {
        console.warn('image-slot-loader: error fetching image for', key, err);
        return null;
      });
  }

  function loadImageKeys() {
    return fetch('./api/image_keys.json')  // let browser cache normally
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  // ── Run on DOMContentLoaded (much earlier than window.load).
  //    Fetch image_keys.json and all per-slot API calls in parallel.
  document.addEventListener('DOMContentLoaded', function () {
    console.debug('image-slot-loader: DOM ready — starting slot load');

    // Start both fetches at the same time
    var keysPromise = loadImageKeys();
    // We can query the DOM immediately since DOMContentLoaded has fired
    var elems = document.querySelectorAll('[data-image-slot]');
    if (!elems || elems.length === 0) return;

    // Begin per-slot API fetches NOW (don't wait for image_keys.json).
    // image_keys.json is only needed for applyMode metadata and the
    // default fallback URL; we resolve it in parallel and merge later.
    var slotEntries = [];
    elems.forEach(function (el) {
      var key = el.getAttribute('data-image-slot');
      if (!key) return;
      slotEntries.push({ el: el, key: key, imgPromise: fetchImageForKey(key) });
    });

    keysPromise.then(function (imageKeysMap) {
      slotEntries.forEach(function (entry) {
        var meta = imageKeysMap && imageKeysMap[entry.key];
        var defaultApplyMode = (entry.el.tagName && entry.el.tagName.toUpperCase() === 'IMG') ? 'src' : 'background';
        var applyMode = (meta && meta.applyMode) ? meta.applyMode : defaultApplyMode;
        var defaultUrl = (meta && meta.default) ? meta.default : null;

        // Safety timeout: if the API hasn't responded, apply the default
        // image from image_keys.json so the section isn't blank.
        var fallbackTimer = setTimeout(function () {
          console.debug('image-slot-loader: timeout for', entry.key, '— applying default');
          if (defaultUrl) {
            applySlotToElement(entry.el, defaultUrl, applyMode);
          } else {
            revealElement(entry.el);
          }
        }, REVEAL_TIMEOUT_MS);

        entry.imgPromise.then(function (data) {
          clearTimeout(fallbackTimer);
          if (data && data.url) {
            console.debug('image-slot-loader: applying', data.url, 'to', entry.key, 'mode=', applyMode);
            applySlotToElement(entry.el, data.url, applyMode);
          } else {
            // No uploaded image — use the default from image_keys.json
            console.debug('image-slot-loader: no image returned for', entry.key, '— applying default');
            if (defaultUrl) {
              applySlotToElement(entry.el, defaultUrl, applyMode);
            } else {
              revealElement(entry.el);
            }
          }
        });
      });
    });
  });

})();
