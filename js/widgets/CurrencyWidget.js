import { APIWidget } from './APIWidget.js';
import { icon } from '../icons.js';

export class CurrencyWidget extends APIWidget {
  constructor(options) {
    super({ ...options, type: 'currency', title: 'Валюта', subtitle: 'Планы, которые по карману' });
    this.state = { amount: Number.isFinite(options.state?.amount) ? options.state.amount : 100 };
    this.endpoint = 'https://api.frankfurter.dev/v2/rate/eur/usd';
  }

  bindContentEvents() {
    super.bindContentEvents();
    this.listen(this.body, 'input', event => {
      if (event.target.name !== 'amount') return;
      const input = event.target;
      const amount = input.valueAsNumber;
      const valid = input.validity.valid && Number.isFinite(amount) && amount >= 0 && amount <= 100000000;
      input.setAttribute('aria-invalid', String(!valid));
      if (valid) {
        this.state.amount = amount;
        this.notify();
      }
      this.updateConversion(valid);
    });
  }

  normalize(data) {
    if (!Number.isFinite(data?.rate) || data.rate <= 0 || typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || data.base !== 'EUR' || data.quote !== 'USD') {
      throw new Error('Unexpected currency response');
    }
    return { rate: data.rate, date: data.date };
  }

  renderData(data) {
    const rate = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(data.rate);
    const date = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'Europe/Moscow' }).format(new Date(`${data.date}T12:00:00+03:00`));
    this.body.innerHTML = `<div class="widget-body-inner"><div class="currency-pair"><span class="currency-flags" aria-hidden="true">🇪🇺 🇺🇸</span> EUR <span aria-hidden="true">→</span> USD</div><p class="rate-value">${rate}<small>USD</small></p><p class="rate-caption">за 1 евро · справочный курс</p><div class="conversion-box"><label class="conversion-label" for="${this.id}-amount">Ваш бюджет в евро</label><div class="conversion-line"><input id="${this.id}-amount" type="number" name="amount" value="${this.state.amount}" min="0" max="100000000" step="0.01" inputmode="decimal" aria-describedby="${this.id}-conversion-note" required><span class="currency-code">EUR</span></div><div class="conversion-divider"><span class="conversion-equals" aria-hidden="true">↓</span></div><output class="conversion-result" for="${this.id}-amount" aria-live="polite"><span class="conversion-total"></span><span class="currency-code">USD</span></output></div><p class="conversion-note" id="${this.id}-conversion-note">Для оценки бюджета. Курс банка может отличаться.</p><div class="widget-footer"><a href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer" aria-label="Данные Frankfurter, открыть источник">Frankfurter ↗</a><button class="refresh-button" type="button" data-refresh aria-label="Обновить курс валют">${icon('refresh')} ${date}</button></div></div>`;
    this.updateConversion(true);
  }

  updateConversion(valid) {
    const output = this.body.querySelector('.conversion-total');
    if (!output || !this.data) return;
    output.textContent = valid
      ? new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.amount * this.data.rate)
      : 'Укажите сумму от 0 до 100 000 000';
  }
}
