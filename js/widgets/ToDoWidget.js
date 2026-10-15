import { UIComponent } from '../UIComponent.js';

export const DEFAULT_TASKS = [
  { id: 'documents', text: 'Проверить документы', done: true },
  { id: 'backpack', text: 'Собрать рюкзак', done: false },
  { id: 'offline-map', text: 'Скачать офлайн-карту', done: false }
];

export class ToDoWidget extends UIComponent {
  constructor(options) {
    super({ ...options, type: 'todo', title: 'Список дел', subtitle: 'Всё начинается с маленьких шагов' });
    this.state = { tasks: Array.isArray(options.state?.tasks) ? options.state.tasks : DEFAULT_TASKS.map(task => ({ ...task })) };
  }

  bindContentEvents() {
    this.listen(this.body, 'submit', event => {
      if (!event.target.matches('.todo-form')) return;
      event.preventDefault();
      const input = event.target.elements.task;
      const text = input.value.trim();
      if (!text) {
        input.setCustomValidity('Напишите, что нужно сделать.');
        input.reportValidity();
        return;
      }
      if (this.state.tasks.length >= 100) {
        input.setCustomValidity('Список вмещает 100 дел. Удалите выполненные, чтобы добавить новое.');
        input.reportValidity();
        return;
      }
      this.state.tasks.push({ id: globalThis.crypto?.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(16).slice(2)}`, text, done: false });
      this.renderTasks();
      input.value = '';
      input.focus();
      this.notify();
    });
    this.listen(this.body, 'input', event => {
      if (event.target.name === 'task') event.target.setCustomValidity('');
    });
    this.listen(this.body, 'change', event => {
      const checkbox = event.target.closest('[data-task-check]');
      if (!checkbox) return;
      const task = this.state.tasks.find(item => item.id === checkbox.dataset.taskCheck);
      if (!task) return;
      task.done = checkbox.checked;
      checkbox.closest('.todo-item').classList.toggle('is-done', task.done);
      this.updateProgress();
      this.notify();
    });
    this.listen(this.body, 'click', event => {
      const button = event.target.closest('[data-task-delete]');
      if (!button) return;
      const index = this.state.tasks.findIndex(item => item.id === button.dataset.taskDelete);
      if (index < 0) return;
      this.state.tasks.splice(index, 1);
      this.renderTasks();
      const nextTask = this.body.querySelectorAll('[data-task-delete]')[Math.min(index, this.state.tasks.length - 1)];
      (nextTask || this.body.querySelector('[name="task"]')).focus();
      this.notify();
    });
  }

  renderContent() {
    this.body.innerHTML = `<div class="widget-body-inner"><div class="todo-summary"><strong class="todo-counter" aria-live="polite"></strong><span>дел выполнено</span></div><div class="progress-track" role="progressbar" aria-label="Выполнение списка дел" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill"></div></div><ul class="todo-list" aria-label="Дела перед поездкой"></ul><form class="todo-form"><label class="sr-only" for="${this.id}-task-input">Новое дело</label><input id="${this.id}-task-input" name="task" placeholder="Что ещё нужно сделать?" maxlength="160" autocomplete="off" required><button class="todo-add" type="submit" aria-label="Добавить дело" title="Добавить дело">＋</button></form><div class="widget-footer"><span>Маленькие шаги → большие планы</span><span aria-hidden="true">↗</span></div></div>`;
    this.renderTasks();
  }

  renderTasks() {
    const list = this.body.querySelector('.todo-list');
    list.replaceChildren();
    if (!this.state.tasks.length) {
      const empty = document.createElement('li');
      empty.className = 'todo-empty';
      empty.textContent = 'Чистый лист — начало нового маршрута. Добавьте первое дело ниже.';
      list.append(empty);
    }
    this.state.tasks.forEach(task => {
      const item = document.createElement('li');
      item.className = `todo-item${task.done ? ' is-done' : ''}`;
      const label = document.createElement('label');
      label.className = 'todo-check-label';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.dataset.taskCheck = task.id;
      const text = document.createElement('span');
      text.className = 'todo-text';
      text.textContent = task.text;
      label.append(checkbox, text);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'icon-button todo-delete';
      button.dataset.taskDelete = task.id;
      button.setAttribute('aria-label', `Удалить дело «${task.text}»`);
      button.title = 'Удалить дело';
      button.textContent = '×';
      item.append(label, button);
      list.append(item);
    });
    this.updateProgress();
  }

  updateProgress() {
    const done = this.state.tasks.filter(task => task.done).length;
    const total = this.state.tasks.length;
    const percentage = total ? Math.round(done / total * 100) : 0;
    const counter = this.body.querySelector('.todo-counter');
    counter.replaceChildren(document.createTextNode(String(done)));
    const small = document.createElement('small');
    small.textContent = ` / ${total}`;
    counter.append(small);
    this.body.querySelector('.progress-fill').style.width = `${percentage}%`;
    const progress = this.body.querySelector('[role="progressbar"]');
    progress.setAttribute('aria-valuenow', String(percentage));
    progress.setAttribute('aria-valuetext', `${done} из ${total} дел выполнено`);
  }
}
