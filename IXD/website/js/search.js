/* ========================================
   WHERE TO FIND WILDLIFE — Fuzzy Search
   Attaches to .search-bar elements across the site
   ======================================== */

(function () {
  // Build searchable index from species data.
  // Each entry: { slug, name, keywords, type }
  function buildIndex() {
    const index = [];
    if (typeof SPECIES_DATA !== 'undefined') {
      Object.keys(SPECIES_DATA).forEach(slug => {
        const s = SPECIES_DATA[slug];
        const keywords = [s.name.toLowerCase(), ...s.examples.map(e => e.toLowerCase())];
        index.push({
          slug,
          name: s.name,
          examples: s.examples,
          keywords,
          type: 'species'
        });
      });
    }
    // Parks (match the dropdown on map.html)
    const parks = [
      { slug: 'yosemite',     name: 'Yosemite' },
      { slug: 'yellowstone',  name: 'Yellowstone' },
      { slug: 'death-valley', name: 'Death Valley' },
      { slug: 'glacier',      name: 'Glacier' },
      { slug: 'grand-canyon', name: 'Grand Canyon' },
      { slug: 'zion',         name: 'Zion' }
    ];
    parks.forEach(p => {
      index.push({
        slug: p.slug,
        name: p.name,
        keywords: [p.name.toLowerCase()],
        type: 'park'
      });
    });
    return index;
  }

  // Simple fuzzy score — higher is better, 0 means no match.
  function fuzzyScore(needle, haystack) {
    needle = needle.toLowerCase().trim();
    haystack = haystack.toLowerCase();
    if (!needle) return 0;
    if (haystack === needle) return 1000;
    if (haystack.startsWith(needle)) return 500 - (haystack.length - needle.length);
    const idx = haystack.indexOf(needle);
    if (idx >= 0) return 200 - idx;

    // Subsequence match (every char of needle appears in haystack in order)
    let hi = 0;
    let score = 0;
    for (let ni = 0; ni < needle.length; ni++) {
      const ch = needle[ni];
      const found = haystack.indexOf(ch, hi);
      if (found === -1) return 0;
      score += Math.max(0, 50 - (found - hi));
      hi = found + 1;
    }
    return score;
  }

  function scoreEntry(entry, query) {
    let best = 0;
    // Score against name & examples
    entry.keywords.forEach(kw => {
      const s = fuzzyScore(query, kw);
      if (s > best) best = s;
    });
    return best;
  }

  function search(query, index, limit) {
    limit = limit || 8;
    if (!query || !query.trim()) return [];
    return index
      .map(e => ({ entry: e, score: scoreEntry(e, query) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.entry);
  }

  function buildResultItem(entry, query) {
    const li = document.createElement('a');
    li.className = 'search-result-item';
    if (entry.type === 'species') {
      li.href = 'species-detail.html?species=' + entry.slug;
    } else {
      li.href = 'map.html?park=' + entry.slug;
    }

    const typeLabel = document.createElement('span');
    typeLabel.className = 'search-result-type';
    typeLabel.textContent = entry.type === 'species' ? 'Species' : 'Park';

    const name = document.createElement('span');
    name.className = 'search-result-name';
    name.textContent = entry.name;

    li.appendChild(typeLabel);
    li.appendChild(name);
    return li;
  }

  function attachSearch(searchBar) {
    const input = searchBar.querySelector('input');
    if (!input) return;

    // Create results container if missing
    let results = searchBar.querySelector('.search-results');
    if (!results) {
      results = document.createElement('div');
      results.className = 'search-results';
      searchBar.appendChild(results);
    }

    const index = buildIndex();

    function render(query) {
      results.innerHTML = '';
      const matches = search(query, index, 8);
      if (matches.length === 0) {
        searchBar.classList.remove('has-results');
        return;
      }
      matches.forEach(m => results.appendChild(buildResultItem(m, query)));
      searchBar.classList.add('has-results');
    }

    input.addEventListener('input', () => render(input.value));
    input.addEventListener('focus', () => {
      if (input.value.trim()) render(input.value);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!searchBar.contains(e.target)) {
        searchBar.classList.remove('has-results');
      }
    });

    // Allow Enter to jump to the top result
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const top = results.querySelector('.search-result-item');
        if (top) {
          window.location.href = top.href;
        }
      } else if (e.key === 'Escape') {
        searchBar.classList.remove('has-results');
        input.blur();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.search-bar').forEach(attachSearch);
  });
})();
