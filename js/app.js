import { fetchCountries, findCountry, formatPopulation, formatCurrency } from './api.js';
import { loadMap, highlightCountry, resetHighlight } from './map.js';
import { startClock, stopClock } from './clock.js';
import { getLocalCountryData, formatPop } from './data.js';

let countriesData = [];
let currentCountry = null;

const modal = document.getElementById('modal');
const overlay = document.getElementById('overlay');
const closeModalBtn = document.getElementById('closeModal');
const mapContainer = document.getElementById('map-container');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

const flagEl = document.getElementById('flag');
const nameEl = document.getElementById('countryName');
const capitalEl = document.getElementById('capital');
const populationEl = document.getElementById('population');
const currencyEl = document.getElementById('currency');
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const timezoneEl = document.getElementById('timezone');

flagEl.addEventListener('error', () => { flagEl.style.display = 'none'; });

function openModal(code) {
  highlightCountry(code);

  const country = findCountry(countriesData, code);
  const local = getLocalCountryData(code);

  nameEl.textContent = (country && country.name.common) || (local && local.name) || code;

  if (country && country.flags) {
    if (country.flags.svg) {
      flagEl.src = country.flags.svg;
    } else if (country.flags.png) {
      flagEl.src = country.flags.png;
    } else {
      flagEl.src = `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
    }
    flagEl.alt = nameEl.textContent;
    flagEl.style.display = 'block';
  } else if (local) {
    flagEl.src = `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
    flagEl.alt = nameEl.textContent;
    flagEl.style.display = 'block';
  } else {
    flagEl.style.display = 'none';
  }

  capitalEl.textContent = (country && country.capital && country.capital[0]) || (local && local.capital) || 'Н/Д';
  populationEl.textContent = (country && formatPopulation(country.population)) || (local && formatPop(local.population)) || 'Н/Д';
  currencyEl.textContent = (country && formatCurrency(country.currencies)) || (local && local.currency) || 'Н/Д';

  const tz = (country && country.timezones && country.timezones[0]) || (local && local.tz) || 'UTC+0';
  timezoneEl.textContent = tz;
  startClock(tz, clockEl, dateEl);

  currentCountry = code;
  modal.classList.add('active');
  overlay.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
  overlay.classList.remove('active');
  stopClock();
  resetHighlight();
  currentCountry = null;
}

closeModalBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

async function init() {
  loading.style.display = 'flex';
  error.style.display = 'none';

  try {
    await loadMap(mapContainer, openModal);
  } catch (err) {
    loading.style.display = 'none';
    error.style.display = 'flex';
    return;
  }

  loading.style.display = 'none';

  try {
    countriesData = await fetchCountries();
  } catch (apiErr) {
    countriesData = [];
  }
}

init();
