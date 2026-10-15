import { UIComponent } from '../UIComponent.js';

/** Each API widget owns its request, timeout and error; requests are independent. */
export class APIWidget extends UIComponent {
  bindContentEvents() {
    this.listen(this.body, 'click', event => {
      if (event.target.closest('[data-refresh]')) this.load();
    });
  }

  renderContent() { this.load(); }

  async load() {
    if (this.destroyed) return;
    this.requestController?.abort();
    const controller = new AbortController();
    this.requestController = controller;
    let timedOut = false;
    const timeout = this.delay(() => {
      timedOut = true;
      controller.abort();
    }, 12000);
    this.body.setAttribute('aria-busy', 'true');
    this.body.innerHTML = '<div class="api-loading" role="status"><span class="loader" aria-hidden="true"></span><p>Немного терпения.<br>Прокладываем путь к данным…</p></div>';
    try {
      const response = await fetch(this.endpoint, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = this.normalize(await response.json());
      if (this.destroyed || this.requestController !== controller) return;
      this.data = data;
      this.body.setAttribute('aria-busy', 'false');
      this.renderData(data);
    } catch (error) {
      if (this.destroyed || this.requestController !== controller) return;
      if (error.name === 'AbortError' && !timedOut) return;
      this.body.setAttribute('aria-busy', 'false');
      const message = timedOut
        ? 'Сервис отвечает слишком долго. Попробуйте запросить данные ещё раз.'
        : 'Не удалось связаться с сервисом. Проверьте интернет и попробуйте ещё раз.';
      this.body.innerHTML = `<div class="api-error" role="status"><span class="api-error-symbol" aria-hidden="true">↯</span><strong>Небольшая остановка в пути</strong><p>${message}</p><button class="retry-button" type="button" data-refresh>Попробовать снова</button></div>`;
    } finally {
      this.clearDelay(timeout);
      if (this.requestController === controller) this.requestController = null;
    }
  }

  normalize(data) { return data; }

  destroy() {
    this.requestController?.abort();
    this.requestController = null;
    super.destroy();
  }
}
