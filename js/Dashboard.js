import { ToDoWidget } from './widgets/ToDoWidget.js';
import { WeatherWidget } from './widgets/WeatherWidget.js';
import { CurrencyWidget } from './widgets/CurrencyWidget.js';
import { DashboardStorage } from './storage.js';

const WIDGETS = { todo: ToDoWidget, weather: WeatherWidget, currency: CurrencyWidget };
const TITLES = { todo: 'Список дел', weather: 'Погода', currency: 'Валюта' };

export class Dashboard {
  constructor({ grid, empty, count, toast, storageNotice, addButtons, addFirst }) {
    Object.assign(this, { grid, empty, count, toast, storageNotice, addButtons, addFirst });
    this.widgets = new Map();
    this.listeners = [];
    this.toastTimer = null;
    this.storage = new DashboardStorage(message => {
      this.storageNotice.textContent = message;
      this.storageNotice.hidden = false;
    });
    this.state = this.storage.load();
    this.state.widgets.forEach(widget => this.addWidget(widget.type, { collapsed: widget.collapsed, initial: true }));
    this.updateUI();
    this.addButtons.forEach(button => this.listen(button, 'click', () => this.addWidget(button.dataset.add)));
    this.listen(this.addFirst, 'click', () => this.addWidget('todo'));
  }

  listen(target, name, callback) {
    target.addEventListener(name, callback);
    this.listeners.push(() => target.removeEventListener(name, callback));
  }

  addWidget(type, { collapsed = false, initial = false } = {}) {
    if (!Object.hasOwn(WIDGETS, type)) return null;
    const existing = [...this.widgets.values()].find(widget => widget.type === type);
    if (existing) {
      this.announce(`Виджет «${TITLES[type]}» уже на панели. Можно добавить только один виджет каждого типа.`);
      existing.element.focus({ preventScroll: true });
      existing.flash();
      return existing;
    }
    const Widget = WIDGETS[type];
    const widget = new Widget({
      id: `widget-${type}`, type, collapsed, state: this.state.data[type] || {},
      onChange: changedWidget => {
        this.state.data[changedWidget.type] = changedWidget.getState();
        this.persist();
      },
      onRemove: id => this.removeWidget(id)
    });
    this.widgets.set(widget.id, widget);
    this.grid.append(widget.render());
    this.state.data[type] = widget.getState();
    this.updateUI();
    if (!initial) {
      this.persist();
      widget.element.focus({ preventScroll: true });
      this.announce(`Виджет «${TITLES[type]}» добавлен.`);
    }
    return widget;
  }

  removeWidget(id) {
    const widget = this.widgets.get(id);
    if (!widget) return;
    const type = widget.type;
    this.state.data[type] = widget.getState();
    widget.destroy();
    this.widgets.delete(id);
    this.persist();
    this.updateUI();
    this.addButtons.find(button => button.dataset.add === type)?.focus();
    this.announce(`Виджет «${TITLES[type]}» убран. Его можно вернуть кнопкой «${TITLES[type]}».`);
  }

  persist() {
    this.state.widgets = [...this.widgets.values()].map(({ type, collapsed }) => ({ type, collapsed }));
    this.widgets.forEach(widget => { this.state.data[widget.type] = widget.getState(); });
    this.storage.save(this.state);
  }

  updateUI() {
    const size = this.widgets.size;
    this.empty.hidden = size !== 0;
    this.grid.hidden = size === 0;
    this.count.textContent = `${size} ${size === 1 ? 'виджет' : size === 0 ? 'виджетов' : 'виджета'}`;
    this.addButtons.forEach(button => {
      const present = this.widgets.has(`widget-${button.dataset.add}`);
      button.classList.toggle('is-present', present);
      button.setAttribute('aria-label', `Добавить виджет «${TITLES[button.dataset.add]}»${present ? ' (уже на панели)' : ''}`);
      button.title = present ? 'Уже на панели — только один виджет каждого типа' : 'Добавить на панель';
    });
  }

  announce(message) {
    window.clearTimeout(this.toastTimer);
    this.toast.textContent = message;
    this.toast.hidden = false;
    this.toastTimer = window.setTimeout(() => {
      this.toast.hidden = true;
      this.toastTimer = null;
    }, 5000);
  }

  destroy() {
    this.listeners.forEach(removeListener => removeListener());
    this.listeners = [];
    window.clearTimeout(this.toastTimer);
    this.widgets.forEach(widget => widget.destroy());
    this.widgets.clear();
  }
}
