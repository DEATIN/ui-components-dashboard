import { Dashboard } from './Dashboard.js';

const date = document.querySelector('#today');
const now = new Date();
date.dateTime = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Moscow' }).format(now);
date.textContent = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' }).format(now);

const dashboard = new Dashboard({
  grid: document.querySelector('#widget-grid'),
  empty: document.querySelector('#empty-dashboard'),
  count: document.querySelector('#widget-count'),
  toast: document.querySelector('#toast'),
  storageNotice: document.querySelector('#storage-notice'),
  addButtons: [...document.querySelectorAll('[data-add]')],
  addFirst: document.querySelector('#add-first-widget')
});

// A BFCache navigation keeps the live page intact; final navigation cleans up.
window.addEventListener('pagehide', event => {
  if (!event.persisted) dashboard.destroy();
});
