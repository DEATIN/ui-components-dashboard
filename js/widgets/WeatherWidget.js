import { APIWidget } from './APIWidget.js';
import { icon } from '../icons.js';

function describeWeather(code) {
  if (code === 0) return ['Ясно — отличный день для прогулки', 'sun'];
  if ([1, 2].includes(code)) return ['Переменная облачность', 'weather'];
  if (code === 3) return ['Облачно', 'cloud'];
  if ([45, 48].includes(code)) return ['Туман — берегите ориентиры', 'fog'];
  if ([71, 73, 75, 77, 85, 86].includes(code)) return ['Снег — одевайтесь теплее', 'snow'];
  if ([95, 96, 99].includes(code)) return ['Гроза — лучше переждать в тепле', 'storm'];
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return ['Дождь — захватите зонт', 'rain'];
  return ['Погода в точке отправления', 'weather'];
}

export class WeatherWidget extends APIWidget {
  constructor(options) {
    super({ ...options, type: 'weather', title: 'Погода', subtitle: 'Как там за окном?' });
    const params = new URLSearchParams({
      latitude: '59.9386', longitude: '30.3141',
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      timezone: 'Europe/Moscow', wind_speed_unit: 'ms'
    });
    this.endpoint = `https://api.open-meteo.com/v1/forecast?${params}`;
  }

  normalize(data) {
    const current = data?.current;
    const keys = ['temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'weather_code', 'wind_speed_10m'];
    if (!current || !keys.every(key => Number.isFinite(current[key])) || typeof current.time !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(current.time)) {
      throw new Error('Unexpected weather response');
    }
    return current;
  }

  renderData(current) {
    const [description, weatherIcon] = describeWeather(current.weather_code);
    const temperature = Math.round(current.temperature_2m);
    const feels = Math.round(current.apparent_temperature);
    const wind = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(current.wind_speed_10m);
    const updated = current.time.slice(11, 16); // API time is already Europe/Moscow.
    this.body.innerHTML = `<div class="widget-body-inner"><p class="weather-location"><span aria-hidden="true">↗</span> Санкт-Петербург</p><div class="weather-main"><div class="temperature">${temperature > 0 ? '+' : ''}${temperature}<sup>°</sup><span class="sr-only"> Цельсия</span></div><span class="weather-large-icon">${icon(weatherIcon)}</span></div><p class="weather-condition" role="status">${description}</p><p class="weather-feels">Ощущается как ${feels > 0 ? '+' : ''}${feels}°</p><div class="weather-metrics"><div class="weather-metric"><span class="metric-icon">${icon('wind')}</span><div><strong>${wind} м/с</strong><small>Ветер</small></div></div><div class="weather-metric"><span class="metric-icon">${icon('drop')}</span><div><strong>${Math.round(current.relative_humidity_2m)}%</strong><small>Влажность</small></div></div></div><div class="widget-footer"><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" aria-label="Данные Open-Meteo, открыть источник">Open-Meteo ↗</a><button class="refresh-button" type="button" data-refresh aria-label="Обновить погоду">${icon('refresh')} ${updated} МСК</button></div></div>`;
  }
}
