/* ========================================
   WHERE TO FIND WILDLIFE — Animal Cutout
   Canvas-based background removal
   ======================================== */

(function () {

  /**
   * Sample edge pixels to estimate background color.
   * Returns { r, g, b } median of all edge samples.
   */
  function sampleBackground(data, w, h) {
    const samples = [];
    const step = 4; // sample every 4th edge pixel

    // Top & bottom rows
    for (let x = 0; x < w; x += step) {
      const iTop = (x) * 4;
      const iBot = ((h - 1) * w + x) * 4;
      samples.push([data[iTop], data[iTop + 1], data[iTop + 2]]);
      samples.push([data[iBot], data[iBot + 1], data[iBot + 2]]);
    }
    // Left & right columns
    for (let y = 0; y < h; y += step) {
      const iL = (y * w) * 4;
      const iR = (y * w + w - 1) * 4;
      samples.push([data[iL], data[iL + 1], data[iL + 2]]);
      samples.push([data[iR], data[iR + 1], data[iR + 2]]);
    }

    // Sort each channel and take the median (robust vs. animal touching edge)
    const rs = samples.map(s => s[0]).sort((a, b) => a - b);
    const gs = samples.map(s => s[1]).sort((a, b) => a - b);
    const bs = samples.map(s => s[2]).sort((a, b) => a - b);
    const mid = Math.floor(samples.length / 2);
    return { r: rs[mid], g: gs[mid], b: bs[mid] };
  }

  /**
   * Remove background pixels from imageData in-place.
   * threshold: hard remove distance; feather: soft fade zone beyond that.
   */
  function removeBackground(data, w, h, threshold, feather) {
    const bg = sampleBackground(data, w, h);

    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i]     - bg.r;
      const dg = data[i + 1] - bg.g;
      const db = data[i + 2] - bg.b;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      if (dist < threshold) {
        data[i + 3] = 0; // fully transparent
      } else if (dist < threshold + feather) {
        // Smooth feathered edge
        const t = (dist - threshold) / feather;
        data[i + 3] = Math.round(t * t * 255);
      }
      // else: keep original alpha
    }
  }

  /**
   * Try to cut out a single animal image element.
   * Replaces the <img> with a <canvas> inside the same parent.
   * Falls back gracefully if CORS is blocked.
   */
  function cutout(img, options) {
    const { threshold = 55, feather = 35 } = options || {};

    function process() {
      if (!img.naturalWidth) return; // still nothing loaded

      const w = img.naturalWidth;
      const h = img.naturalHeight;

      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');

      try {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h); // throws on CORS fail
        removeBackground(imageData.data, w, h, threshold, feather);
        ctx.putImageData(imageData, 0, 0);
      } catch (e) {
        // CORS blocked — draw without removal, keep visual quality
        ctx.drawImage(img, 0, 0);
      }

      // Transfer positioning / sizing from <img>
      canvas.style.cssText     = img.style.cssText;
      canvas.style.display     = 'block';
      canvas.style.width       = '100%';
      canvas.style.height      = '100%';
      canvas.style.objectFit   = 'contain';
      canvas.dataset.species   = img.dataset ? img.dataset.species : '';

      img.parentNode.replaceChild(canvas, img);
    }

    if (img.complete && img.naturalWidth > 0) {
      process();
    } else {
      img.addEventListener('load', process);
      img.addEventListener('error', () => { /* leave as is */ });
    }
  }

  /**
   * Process all animal cutout images on the page.
   * Per-species thresholds: sky backgrounds can be more aggressive.
   */
  function init() {
    const configs = {
      // Sky/open backgrounds — moderate removal
      'raptors':        { threshold: 48, feather: 28 },
      'waterbirds':     { threshold: 44, feather: 26 },
      'songbirds':      { threshold: 44, feather: 26 },
      'butterflies':    { threshold: 40, feather: 24 },
      'other-insects':  { threshold: 38, feather: 22 },
      'fish':           { threshold: 42, feather: 24 },
      // Natural/ground backgrounds — conservative removal
      'large-mammals':  { threshold: 32, feather: 20 },
      'small-mammals':  { threshold: 32, feather: 20 },
      'reptiles':       { threshold: 30, feather: 18 },
      'amphibians':     { threshold: 38, feather: 22 },
      'marine-mammals': { threshold: 32, feather: 20 },
    };

    document.querySelectorAll('.animal-cutout img').forEach(img => {
      const species = img.closest('.animal-cutout')?.dataset.species || '';
      const opts = configs[species] || { threshold: 50, feather: 30 };
      cutout(img, opts);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
