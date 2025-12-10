// image-slot-loader.js
// Loads images for elements that declare `data-image-slot`.
// Enhanced debug + flexible API host detection.

(function () {
  'use strict';

  const DEFAULT_API_HOST = 'https://api.pennrobotics.org';

  function detectBaseUrl() {
    if (window.IMAGE_SLOT_API_BASE) {
      return window.IMAGE_SLOT_API_BASE;
    }
    const host = window.location.hostname || '';
    const port = window.location.port || '';
    // If running on a common dev host, point to local backend
    if (host === '127.0.0.1' || host === 'localhost' || host === '0.0.0.0' || host.startsWith('192.168.') || port === '5500') {
      return 'http://127.0.0.1:5000';
    }
    // Otherwise use production API host
    return DEFAULT_API_HOST;
  }

  const baseUrl = detectBaseUrl();
  console.debug('image-slot-loader: baseUrl =', baseUrl);

  function applySlotToElement(el, url, applyMode) {
    if (!el || !url) return;
    const tag = (el.tagName || '').toUpperCase();
    
    if (applyMode === 'src' && tag === 'IMG') {
      // Direct IMG element: replace src
      el.src = url;
    } else if (tag === 'IMG') {
      // IMG element but background mode requested: apply as background (unusual but allowed)
      el.style.backgroundImage = `url('${url}')`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
    } else {
      // Non-IMG element: check if it contains IMG children that would conflict
      const childImages = el.querySelectorAll('img');
      if (childImages.length > 0) {
        // If the element contains images, replace the first child image's src instead of using background
        // This prevents "stacking" where both the child image and background are visible
        childImages[0].src = url;
        // Hide any additional child images to avoid confusion
        for (let i = 1; i < childImages.length; i++) {
          childImages[i].style.display = 'none';
        }
      } else {
        // No child images: safe to apply as background
        el.style.backgroundImage = `url('${url}')`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
    }
  }

  function fetchImageForKey(key) {
    const url = `${baseUrl}/get-image?key=${encodeURIComponent(key)}`;
    console.debug('image-slot-loader: fetching', url);
    return fetch(url, { cache: 'no-cache' })
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
    return fetch('./api/image_keys.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  function loadSlots(imageKeysMap) {
    const elems = document.querySelectorAll('[data-image-slot]');
    console.debug('image-slot-loader: found elements with data-image-slot:', elems.length);
    if (!elems || elems.length === 0) return;

    elems.forEach(el => {
      const key = el.getAttribute('data-image-slot');
      if (!key) return;
      console.debug('image-slot-loader: loading key', key, 'for element', el);

      const meta = imageKeysMap && imageKeysMap[key];
      const defaultApplyMode = (el.tagName && el.tagName.toUpperCase() === 'IMG') ? 'src' : 'background';
      const applyMode = (meta && meta.applyMode) ? meta.applyMode : defaultApplyMode;

      fetchImageForKey(key).then(data => {
        if (data && data.url) {
          console.debug('image-slot-loader: applying', data.url, 'to', key, 'mode=', applyMode);
          applySlotToElement(el, data.url, applyMode);
        } else {
          console.debug('image-slot-loader: no image returned for', key);
        }
      });
    });
  }

  // Run after load. If you need to override base url in dev, set window.IMAGE_SLOT_API_BASE
  window.addEventListener('load', function () {
    console.debug('image-slot-loader: page loaded — starting slot load');
    loadImageKeys().then(map => loadSlots(map));
  });

})();
