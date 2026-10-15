import { DEFAULT_TASKS } from './widgets/ToDoWidget.js';

export const STORAGE_KEY = 'marshrut-dashboard-v1';
const TYPES = ['todo', 'weather', 'currency'];
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function defaultState() {
  return {
    version: 1,
    widgets: TYPES.map(type => ({ type, collapsed: false })),
    data: { todo: { tasks: DEFAULT_TASKS.map(task => ({ ...task })) }, currency: { amount: 100 } }
  };
}

function normalizeState(raw) {
  if (!record(raw) || raw.version !== 1 || !Array.isArray(raw.widgets)) throw new Error('Invalid saved dashboard');
  const usedTypes = new Set();
  const widgets = raw.widgets.filter(widget => {
    if (!record(widget) || !TYPES.includes(widget.type) || usedTypes.has(widget.type)) return false;
    usedTypes.add(widget.type);
    return true;
  }).map(widget => ({ type: widget.type, collapsed: widget.collapsed === true }));
  const state = defaultState();
  state.widgets = widgets;
  if (record(raw.data) && record(raw.data.todo) && Array.isArray(raw.data.todo.tasks)) {
    const usedIds = new Set();
    state.data.todo.tasks = raw.data.todo.tasks.filter(task => {
      if (!record(task) || typeof task.id !== 'string' || !task.id || typeof task.text !== 'string' || !task.text.trim()) return false;
      const normalizedId = task.id.slice(0, 100);
      if (usedIds.has(normalizedId)) return false;
      usedIds.add(normalizedId);
      return true;
    }).slice(0, 100).map(task => ({ id: task.id.slice(0, 100), text: task.text.trim().slice(0, 160), done: task.done === true }));
  }
  const amount = raw.data?.currency?.amount;
  if (Number.isFinite(amount) && amount >= 0 && amount <= 100000000) state.data.currency.amount = amount;
  return state;
}

export class DashboardStorage {
  constructor(onNotice) { this.onNotice = onNotice; this.noticeShown = false; }

  warn(message) {
    if (this.noticeShown) return;
    this.noticeShown = true;
    this.onNotice(message);
  }

  load() {
    let saved;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      this.warn('Браузер запретил сохранение. Панель работает, но изменения сохранятся только до перезагрузки страницы.');
      return defaultState();
    }
    if (saved === null) return defaultState();
    try {
      return normalizeState(JSON.parse(saved));
    } catch {
      this.warn('Не удалось прочитать сохранённую панель. Мы открыли новый маршрут — можно настроить его заново.');
      return defaultState();
    }
  }

  save(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      this.warn('Сохранение недоступно. Панель работает, но изменения сохранятся только до перезагрузки страницы.');
      return false;
    }
  }
}
