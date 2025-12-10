(function () {
  // Global focus-arrow helper. Looks for #focus=<key> in the URL hash
  // and draws a large arrow overlay pointing to the element with
  // `[data-image-slot="<key>"]` on the page.

  'use strict';

  function getFocusKeyFromHash() {
    var h = location.hash || '';
    if (!h.startsWith('#focus=')) return null;
    try { return decodeURIComponent(h.slice('#focus='.length)); } catch (e) { return h.slice('#focus='.length); }
  }

  var key = getFocusKeyFromHash();
  if (!key) return;

  // Configurable constants
  var ARROW_WIDTH = 140; // px
  var ARROW_HEIGHT = 88; // px
  var GAP = 10; // px gap between arrow and element
  var EXTRA_NUDGE = 10; // additional px to leave a small gap as requested
  var SCROLL_DELAY = 220; // ms to wait after smooth scroll before re-position

  function safeSelectorForKey(k) {
    if (window.CSS && CSS.escape) return '[data-image-slot="' + CSS.escape(k) + '"]';
    return '[data-image-slot="' + k.replace(/"/g, '\\"') + '"]';
  }

  function removeArrow(arrowEl) {
    if (!arrowEl) return;
    arrowEl.classList.add('hidden');
    setTimeout(function () { try { arrowEl.remove(); } catch (e) {} }, 180);
    document.removeEventListener('click', onAnyInteraction, true);
    window.removeEventListener('resize', onAnyInteraction);
  }

  function onAnyInteraction() { removeArrow(currentArrow); }

  var currentArrow = null;
  var isAutoScrolling = false;

  function onAnyInteraction(e) {
    // Only dismiss on explicit user clicks or keydown. Ignore scrolls.
    if (e && e.type === 'click') { removeArrow(currentArrow); return; }
    if (e && e.type === 'keydown') { removeArrow(currentArrow); return; }
    // otherwise ignore (no-op)
  }

  document.addEventListener('DOMContentLoaded', function () {
    var selector = safeSelectorForKey(key);
    var el = document.querySelector(selector);
    if (!el) return;

    // Scroll element into view (center) and mark that we're auto-scrolling
    isAutoScrolling = true;
    try { 
      el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
    } catch (e) { 
      el.scrollIntoView();
    }
    // ensure the auto-scroll flag clears after sufficient delay for smooth scroll to complete
    setTimeout(function () { isAutoScrolling = false; }, SCROLL_DELAY + 400);

    // Wait longer for smooth scroll to complete before calculating arrow position
    setTimeout(function () {
      var rect = el.getBoundingClientRect();
      var vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

      var elementCenterY = rect.top + rect.height / 2;
      var placeBelow = elementCenterY < (vh * 0.5);

      // Calculate positions
      var elemCenterX = rect.left + rect.width / 2;
      var arrowWidth = ARROW_WIDTH;
      var svgH = ARROW_HEIGHT;
      var left = elemCenterX - arrowWidth / 2;
      var minLeft = 8;
      var maxLeft = vw - arrowWidth - 8;
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;

      var top;
      var rotation = 0;
      if (placeBelow) {
        top = window.scrollY + rect.bottom + GAP + EXTRA_NUDGE;
        rotation = 0; // pointing up
      } else {
        top = window.scrollY + rect.top - svgH - GAP - EXTRA_NUDGE;
        rotation = 180; // pointing down
      }

      // Check if arrow would be off-screen vertically; compute delta and include EXTRA_NUDGE
      var viewportTop = window.scrollY;
      var viewportBottom = window.scrollY + vh;
      var desiredTop = top;
      var extraTop = 8;
      var delta = 0;
      if (desiredTop < viewportTop + extraTop) {
        delta = desiredTop - (viewportTop + extraTop);
        delta -= EXTRA_NUDGE; // extra upward nudge
      } else if ((desiredTop + svgH) > (viewportBottom - extraTop)) {
        delta = (desiredTop + svgH) - (viewportBottom - extraTop);
        delta += EXTRA_NUDGE; // extra downward nudge
      }

      // Build arrow element (container only; styles are provided via SCSS file)
      var arrow = document.createElement('div');
      arrow.className = 'image-focus-arrow';
      // Inline fallbacks to ensure visibility even if SCSS isn't loaded
      // IMPORTANT: use 'absolute' not 'fixed' because top is calculated with window.scrollY
      arrow.style.position = 'absolute';
      arrow.style.pointerEvents = 'none';
      arrow.style.zIndex = '2200';
      arrow.style.transition = 'opacity 160ms ease';
      arrow.style.opacity = '1';
      arrow.style.transformOrigin = '50% 50%';

      // Provided SVG (points up naturally). Keep fill/stroke as red by default; CSS can override via fill/currentColor.
      var svgMarkup = '\n<svg fill="#ff0000" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="-2.43 -2.43 65.59 65.59" xml:space="preserve">\n  <polygon points="30.366,0 0.625,29.735 17.998,29.735 18.003,60.731 42.733,60.729 42.733,29.735 60.107,29.735 "></polygon>\n</svg>\n';
      var tmp = document.createElement('div');
      tmp.innerHTML = svgMarkup.trim();
      var providedSvg = tmp.querySelector('svg');
      if (providedSvg) {
        providedSvg.setAttribute('width', arrowWidth);
        providedSvg.setAttribute('height', svgH);
        providedSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        providedSvg.classList.add('pr-focus-arrow-shape');
        // ensure the svg fills the arrow container
        providedSvg.style.display = providedSvg.style.display || 'block';
        providedSvg.style.width = '100%';
        providedSvg.style.height = '100%';
        providedSvg.style.transformOrigin = '50% 50%';
      }

      function placeArrowAt(finalTop) {
        var vw2 = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var maxLeft2 = vw2 - arrowWidth - 8;
        if (left < 8) left = 8;
        if (left > maxLeft2) left = maxLeft2;
        arrow.style.left = left + 'px';
        arrow.style.top = finalTop + 'px';
        arrow.style.width = arrowWidth + 'px';
        arrow.style.height = svgH + 'px';
        arrow.style.transform = 'translateX(0px) rotate(' + rotation + 'deg)';
      }

      function finalizePlacement(finalTop) {
        placeArrowAt(finalTop);
        try {
          if (providedSvg) arrow.appendChild(providedSvg);
          document.body.appendChild(arrow);
          currentArrow = arrow;
          console.log('focus-arrow: placed arrow', { left: left, top: finalTop, rotation: rotation, key: key });
        } catch (err) {
          console.error('focus-arrow: failed to append arrow', err);
        }

        document.addEventListener('click', onAnyInteraction, true);
        // do not auto-dismiss on scroll; keep arrow visible during scroll
        window.addEventListener('resize', onAnyInteraction);
      }

      if (delta !== 0) {
        // programmatic nudge; mark auto-scrolling so we don't dismiss the arrow
        isAutoScrolling = true;
        window.scrollBy({ top: delta, left: 0, behavior: 'smooth' });
        setTimeout(function () {
          var newRect = el.getBoundingClientRect();
          var newTop = placeBelow 
            ? (window.scrollY + newRect.bottom + GAP + EXTRA_NUDGE) 
            : (window.scrollY + newRect.top - svgH - GAP - EXTRA_NUDGE);
          finalizePlacement(newTop);
          // clear auto-scrolling marker shortly after placement
          setTimeout(function () { isAutoScrolling = false; }, 150);
        }, SCROLL_DELAY);
      } else {
        finalizePlacement(desiredTop);
      }

    }, 600); // Increased from 300ms to 600ms to ensure smooth scroll completes
  });
})();
