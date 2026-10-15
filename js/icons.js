const paths = {
  todo: '<path d="M9 5h11M9 12h11M9 19h11M3 5l1 1 2-2M3 12l1 1 2-2M3 19l1 1 2-2"/>',
  weather: '<path d="M7 17a4 4 0 1 1 .4-8A5.5 5.5 0 0 1 18 10a3.5 3.5 0 1 1 0 7H7Z"/>',
  currency: '<path d="M15.5 6.5A6 6 0 1 0 15.5 17.5M4 10h10M4 14h9M19 4v16"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.6-1L20 9M4 15l2.3 3A7 7 0 0 0 18 17"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h6"/>',
  drop: '<path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  cloud: '<path d="M6 19a5 5 0 0 1-.3-10A6 6 0 0 1 17 8a5.5 5.5 0 0 1 1 11H6Z"/>',
  rain: '<path d="M6 14a4 4 0 0 1-.3-8A5.5 5.5 0 0 1 16 5a4.5 4.5 0 0 1 2 9H6ZM8 18l-1 3M13 18l-1 3M18 18l-1 3"/>',
  snow: '<path d="M6 14a4 4 0 0 1-.3-8A5.5 5.5 0 0 1 16 5a4.5 4.5 0 0 1 2 9H6ZM7 19h.01M12 21h.01M17 19h.01"/>',
  storm: '<path d="M6 14a4 4 0 0 1-.3-8A5.5 5.5 0 0 1 16 5a4.5 4.5 0 0 1 2 9H6ZM13 15l-3 4h4l-3 4"/>',
  fog: '<path d="M6 12a4 4 0 0 1-.3-8A5.5 5.5 0 0 1 16 3a4.5 4.5 0 0 1 2 9H6ZM3 16h18M5 20h14"/>'
};

export function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.weather}</svg>`;
}
