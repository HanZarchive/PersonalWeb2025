/* ========================================
   WHERE TO FIND WILDLIFE — Species Detail JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('species');
  const species = slug ? SPECIES_DATA[slug] : null;

  const detailPage = document.getElementById('species-detail-page');
  const notFound = document.getElementById('species-not-found');

  if (!species) {
    detailPage.hidden = true;
    notFound.hidden = false;
    return;
  }

  // Populate text content
  document.title = species.name + ' — Where to Find Wildlife';
  document.getElementById('species-title').textContent = species.name;
  document.getElementById('species-breadcrumb-name').textContent = species.name;
  document.getElementById('species-description').textContent = species.description;
  document.getElementById('species-image').src = species.image;
  document.getElementById('species-image').alt = species.name;

  // Activity badge
  const activityBadge = document.getElementById('species-activity-badge');
  const activityLabels = {
    peak: 'Peak Activity',
    high: 'High Activity',
    medium: 'Medium Activity',
    low: 'Low Activity',
    minimal: 'Minimal Activity'
  };
  activityBadge.textContent = activityLabels[species.activity] || 'Activity';
  activityBadge.classList.add('badge-' + species.activity);

  // Season badge
  document.getElementById('species-season-badge').textContent = species.season;

  // Examples list
  const examplesList = document.getElementById('species-examples');
  species.examples.forEach(ex => {
    const li = document.createElement('li');
    li.className = 'species-detail__example-item';
    li.textContent = ex;
    examplesList.appendChild(li);
  });

  // Map link — pass the species to map.html. If this group doesn't map to
  // a map species, fall back to an unparameterised link.
  const mapLink = document.getElementById('species-map-link');
  if (species.mapValue) {
    mapLink.href = 'map.html?species=' + species.mapValue;
  } else {
    mapLink.href = 'map.html';
  }
});
