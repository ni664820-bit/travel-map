import { alpha3ToAlpha2 } from './api.js';

let geoData = null;

function equirectangularProjection(lon, lat, width, height) {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

function coordinatesToPath(geometry, width, height) {
  let rings;
  if (geometry.type === 'MultiPolygon') {
    rings = geometry.coordinates.flat();
  } else {
    rings = geometry.coordinates;
  }

  let d = '';
  for (const ring of rings) {
    const points = ring.map(([lon, lat]) => {
      const [x, y] = equirectangularProjection(lon, lat, width, height);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    d += `M${points.join('L')}Z `;
  }
  return d.trim();
}

function parseGeoJSON(geojson) {
  return geojson.features.map(feature => ({
    id: feature.id || feature.properties.name,
    name: feature.properties.name,
    alpha2: alpha3ToAlpha2(feature.id),
    path: coordinatesToPath(feature.geometry, 1000, 500)
  }));
}

export async function loadMap(container, onCountryClick) {
  const res = await fetch('./assets/countries.geojson');
  const geojson = await res.json();
  geoData = parseGeoJSON(geojson);

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 1000 500');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('id', 'world-map');

  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', '1000');
  bg.setAttribute('height', '500');
  bg.setAttribute('fill', '#1a1a2e');
  svg.appendChild(bg);

  const group = document.createElementNS(svgNS, 'g');
  group.setAttribute('id', 'countries-group');

  for (const country of geoData) {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', country.path);
    path.setAttribute('data-country-code', country.alpha2);
    path.setAttribute('data-name', country.name);
    path.setAttribute('fill', '#2d3561');
    path.setAttribute('stroke', '#1a1a2e');
    path.setAttribute('stroke-width', '0.5');
    path.setAttribute('class', 'country-path');
    path.addEventListener('click', () => onCountryClick(country.alpha2));
    group.appendChild(path);
  }

  svg.appendChild(group);
  container.appendChild(svg);

  return geoData;
}

export function highlightCountry(code) {
  document.querySelectorAll('.country-path').forEach(p => {
    p.classList.remove('active');
  });
  if (code) {
    const el = document.querySelector(`[data-country-code="${code}"]`);
    if (el) el.classList.add('active');
  }
}

export function resetHighlight() {
  document.querySelectorAll('.country-path').forEach(p => {
    p.classList.remove('active');
  });
}
