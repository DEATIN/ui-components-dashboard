import { icon } from './icons.js';

/** Common widget lifecycle: DOM, collapse, tracked listeners and timer cleanup. */
export class UIComponent {
  constructor({ id, type, title, subtitle, collapsed = false, state = {}, onChange, onRemove }) {
    Object.assign(this, { id, type, title, subtitle, collapsed, state, onChange, onRemove });
    this.element = null;
    this.destroyed = false;
    this.listeners = [];
    this.timers = new Set();
  }

  render() {
    if (this.element) return this.element;
    this.element = document.createElement('article');
    this.element.className = `widget ${this.type}-widget`;
    this.element.id = this.id;
    this.element.tabIndex = -1;
    this.element.setAttribute('aria-labelledby', `${this.id}-title`);
    // All interpolated values are fixed application metadata, never user text.
    this.element.innerHTML = `
      <header class="widget-header">
        <div class="widget-heading"><span class="widget-icon">${icon(this.type)}</span><div><h3 class="widget-title" id="${this.id}-title">${this.title}</h3><p class="widget-subtitle">${this.subtitle}</p></div></div>
        <div class="widget-controls">
          <button class="icon-button collapse-widget" type="button" aria-controls="${this.id}-body"></button>
          <button class="icon-button remove-widget" type="button" aria-label="Удалить виджет «${this.title}»" title="Удалить виджет">${icon('close')}</button>
        </div>
      </header><div class="widget-body" id="${this.id}-body"></div>`;
    this.body = this.element.querySelector('.widget-body');
    this.collapseButton = this.element.querySelector('.collapse-widget');
    this.listen(this.collapseButton, 'click', () => {
      this.collapsed = !this.collapsed;
      this.applyCollapsed();
      this.notify();
    });
    this.listen(this.element.querySelector('.remove-widget'), 'click', () => this.onRemove(this.id));
    this.applyCollapsed();
    this.bindContentEvents();
    this.renderContent();
    return this.element;
  }

  applyCollapsed() {
    this.body.hidden = this.collapsed;
    this.element.classList.toggle('is-collapsed', this.collapsed);
    this.collapseButton.innerHTML = icon(this.collapsed ? 'plus' : 'minus');
    this.collapseButton.setAttribute('aria-expanded', String(!this.collapsed));
    this.collapseButton.setAttribute('aria-label', `${this.collapsed ? 'Развернуть' : 'Свернуть'} виджет «${this.title}»`);
    this.collapseButton.title = this.collapsed ? 'Развернуть виджет' : 'Свернуть виджет';
  }

  listen(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    this.listeners.push(() => target.removeEventListener(event, handler, options));
  }

  delay(callback, milliseconds) {
    const timer = window.setTimeout(() => {
      this.timers.delete(timer);
      if (!this.destroyed) callback();
    }, milliseconds);
    this.timers.add(timer);
    return timer;
  }

  clearDelay(timer) {
    window.clearTimeout(timer);
    this.timers.delete(timer);
  }

  flash() {
    this.clearDelay(this.flashTimer);
    this.element.classList.remove('widget-highlight');
    // Trigger the highlight again after a repeated duplicate action.
    void this.element.offsetWidth;
    this.element.classList.add('widget-highlight');
    this.flashTimer = this.delay(() => this.element.classList.remove('widget-highlight'), 1300);
  }

  notify() {
    if (!this.destroyed) this.onChange(this);
  }

  getState() { return this.state; }
  bindContentEvents() {}
  renderContent() {}

  destroy() {
    this.destroyed = true;
    this.listeners.forEach(removeListener => removeListener());
    this.listeners = [];
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers.clear();
    this.element?.remove();
    this.element = null;
  }
}
