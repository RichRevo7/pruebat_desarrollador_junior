class DOMManager {
  constructor() {
    this.loginSection = document.getElementById('login-section');
    this.appContainer = document.getElementById('app-container');
    this.loginForm = document.getElementById('login-form');
    this.taskForm = document.getElementById('task-form');
    this.taskFormContainer = document.getElementById('task-form-container');
    this.tasksList = document.getElementById('tasks-list');
    this.tasksTable = document.getElementById('admin-tasks-table');
    this.usersTable = document.getElementById('users-table');
    this.navItems = document.querySelectorAll('.nav-item');
    this.viewSections = document.querySelectorAll('.view');
    this.userInfo = document.getElementById('user-info');
    this.statPending = document.getElementById('stat-pending');
    this.statCompleted = document.getElementById('stat-completed');
    this.statOverdue = document.getElementById('stat-overdue');
    this.logoutBtn = document.getElementById('logout-btn');
    this.addTaskBtn = document.getElementById('add-task-btn');
    this.addUserBtn = document.getElementById('add-user-btn');
    this.cancelTaskBtn = document.getElementById('cancel-task-btn');
    this.modal = document.getElementById('modal');
    this.modalBody = document.getElementById('modal-body');
    this.modalClose = document.querySelector('.modal-close');
    this.notificationsContainer = document.getElementById('notifications-container');
    this.filterStatus = document.getElementById('filter-status');
    this.filterUserAdmin = document.getElementById('filter-user-admin');
    this.searchTasks = document.getElementById('search-tasks');
  }

  showLoginScreen() {
    this.loginSection.style.display = 'flex';
    this.appContainer.style.display = 'none';
  }

  showApp() {
    this.loginSection.style.display = 'none';
    this.appContainer.style.display = 'flex';
  }

  switchView(viewId) {
    this.viewSections.forEach(view => view.classList.remove('active'));

    const view = document.getElementById(`${viewId}-view`);
    if (view) {
      view.classList.add('active');
    }
    this.navItems.forEach(item => item.classList.remove('active'));
    const activeNavItem = document.querySelector(`[data-view="${viewId}"]`);
    if (activeNavItem) {
      activeNavItem.classList.add('active');
    }
  }

  createTaskCard(tarea, usuario, showUser = false) {
    const now = new Date();
    const dueDate = new Date(tarea.due_date);
    const isOverdue = tarea.status === 'Pendiente' && dueDate < now;
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    const card = document.createElement('div');
    card.className = `task-card status-${tarea.status.toLowerCase()}`;
    if (isOverdue) card.classList.add('overdue');
    card.dataset.taskId = tarea.id;

    const dueDateFormatted = new Date(tarea.due_date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let taskHTML = `
      <div class="task-header">
        <div class="task-title">${this.escapeHTML(tarea.title)}</div>
        <span class="task-status ${tarea.status.toLowerCase()}">${tarea.status}</span>
      </div>

      <div class="task-meta">
        <div>Creada: ${new Date(tarea.created_at).toLocaleDateString('es-ES')}</div>
        <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
          📅 Vencimiento: ${dueDateFormatted}
          ${isOverdue ? `<span> ⚠️ ${Math.abs(daysUntilDue)} días atrasada</span>` : ''}
        </div>
        ${showUser ? `<div>👤 ${this.escapeHTML(usuario?.username || 'N/A')}</div>` : ''}
      </div>

      <div class="task-actions">
        <button class="btn btn-secondary btn-sm edit-task-btn" data-id="${tarea.id}">
          ✏️ Editar
        </button>
        ${auth.canEliminarTarea(tarea.user_id) ? `
          <button class="btn btn-danger btn-sm delete-task-btn" data-id="${tarea.id}">
            🗑️ Eliminar
          </button>
        ` : ''}
        ${tarea.status === 'Pendiente' ? `
          <button class="btn btn-success btn-sm complete-task-btn" data-id="${tarea.id}">
            ✓ Completar
          </button>
        ` : ''}
      </div>
    `;

    card.innerHTML = taskHTML;
    return card;
  }

  renderUserTasks(tareas) {
    this.tasksList.innerHTML = '';

    if (tareas.length === 0) {
      document.getElementById('no-tasks-message').style.display = 'block';
      return;
    }

    document.getElementById('no-tasks-message').style.display = 'none';

    tareas.forEach(tarea => {
      const usuario = storage.getUsuarioById(tarea.user_id);
      const card = this.createTaskCard(tarea, usuario, false);
      this.tasksList.appendChild(card);
    });
  }

  renderAdminTasksTable(tareas) {
    const tbody = this.tasksTable.querySelector('tbody');
    tbody.innerHTML = '';

    tareas.forEach(tarea => {
      const usuario = storage.getUsuarioById(tarea.user_id);
      const dueDate = new Date(tarea.due_date);
      const isOverdue = tarea.status === 'Pendiente' && dueDate < new Date();

      const row = document.createElement('tr');
      if (isOverdue) row.classList.add('overdue');

      const dueDateFormatted = dueDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const createdDateFormatted = new Date(tarea.created_at).toLocaleDateString('es-ES');

      row.innerHTML = `
        <td>${tarea.id}</td>
        <td>${this.escapeHTML(tarea.title)}</td>
        <td>${this.escapeHTML(usuario?.username || 'N/A')}</td>
        <td><span class="task-status ${tarea.status.toLowerCase()}">${tarea.status}</span></td>
        <td>${dueDateFormatted}</td>
        <td>${createdDateFormatted}</td>
        <td>
          <button class="btn btn-secondary btn-sm edit-task-btn" data-id="${tarea.id}">Editar</button>
          <button class="btn btn-danger btn-sm delete-task-btn" data-id="${tarea.id}">Eliminar</button>
        </td>
      `;

      tbody.appendChild(row);
    });
  }

  renderUsersTable(usuarios) {
    const tbody = this.usersTable.querySelector('tbody');
    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
      const stats = storage.getEstadisticasUsuario(usuario.id);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${usuario.id}</td>
        <td>${this.escapeHTML(usuario.username)}</td>
        <td><span class="task-status">${usuario.role}</span></td>
        <td>${stats.totalTareas}</td>
        <td>${new Date(usuario.created_at).toLocaleDateString('es-ES')}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-action btn-edit" data-action="edit" data-user-id="${usuario.id}" title="Editar usuario">✏️ Editar</button>
            <button class="btn btn-action btn-password" data-action="password" data-user-id="${usuario.id}" title="Cambiar contraseña">🔐 Contraseña</button>
            <button class="btn btn-action btn-delete" data-action="delete" data-user-id="${usuario.id}" title="Eliminar usuario">🗑️ Eliminar</button>
          </div>
        </td>
      `;

      tbody.appendChild(row);
    });
  }

  showTaskForm() {
    this.taskFormContainer.style.display = 'block';
    this.taskForm.reset();
    document.getElementById('task-id').value = '';
    document.getElementById('task-form-title').textContent = 'Nueva Tarea';
  }

  hideTaskForm() {
    this.taskFormContainer.style.display = 'none';
    this.taskForm.reset();
  }

  editTaskForm(tarea) {
    document.getElementById('task-id').value = tarea.id;
    document.getElementById('task-title').value = tarea.title;
    const fechaParts = tarea.due_date.split('-');
    const fechaFormato = `${fechaParts[0]}-${fechaParts[1]}-${fechaParts[2]}`;
    document.getElementById('task-due-date').value = fechaFormato;
    document.getElementById('task-status').value = tarea.status;
    document.getElementById('task-form-title').textContent = 'Editar Tarea';
    this.taskFormContainer.style.display = 'block';
    this.taskFormContainer.scrollIntoView({ behavior: 'smooth' });
  }

  formatFechaEspanol(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  parseFechaEspanol(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  getTaskFormData() {
    return {
      id: document.getElementById('task-id').value,
      title: document.getElementById('task-title').value,
      due_date: document.getElementById('task-due-date').value,
      status: document.getElementById('task-status').value
    };
  }

  updateUserInfo(user) {
    if (user) {
      this.userInfo.textContent = `👤 ${user.username} (${user.role})`;
    }
  }

  updateStats(userId) {
    const stats = storage.getEstadisticasUsuario(userId);

    this.statPending.textContent = stats.tareasPendientes;
    this.statCompleted.textContent = stats.tareasCompletadas;
    this.statOverdue.textContent = stats.tareasAtrasadas;
  }

  updateDashboard(userId) {
    const usuario = storage.getUsuarioById(userId);
    const stats = storage.getEstadisticasUsuario(userId);

    let resumeHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div style="padding: 1rem; background: #f0f9ff; border-radius: 0.5rem;">
          <div style="font-size: 0.875rem; color: #666;">Total de Tareas</div>
          <div style="font-size: 2rem; font-weight: bold; color: #3b82f6;">${stats.totalTareas}</div>
        </div>
        <div style="padding: 1rem; background: #fef3c7; border-radius: 0.5rem;">
          <div style="font-size: 0.875rem; color: #666;">Pendientes</div>
          <div style="font-size: 2rem; font-weight: bold; color: #f59e0b;">${stats.tareasPendientes}</div>
        </div>
        <div style="padding: 1rem; background: #dcfce7; border-radius: 0.5rem;">
          <div style="font-size: 0.875rem; color: #666;">Completadas</div>
          <div style="font-size: 2rem; font-weight: bold; color: #10b981;">${stats.tareasCompletadas}</div>
        </div>
        <div style="padding: 1rem; background: #fee2e2; border-radius: 0.5rem;">
          <div style="font-size: 0.875rem; color: #666;">Atrasadas</div>
          <div style="font-size: 2rem; font-weight: bold; color: #ef4444;">${stats.tareasAtrasadas}</div>
        </div>
      </div>
    `;

    document.getElementById('dashboard-summary').innerHTML = resumeHTML;
  }

  updateUpcomingTasks(userId, dias = 7) {
    const tareas = storage.getTareasByUsuario(userId);
    const now = new Date();
    const futuro = new Date(now.getTime() + dias * 24 * 60 * 60 * 1000);

    const upcomingTareas = tareas
      .filter(t => 
        t.status === 'Pendiente' &&
        new Date(t.due_date) >= now &&
        new Date(t.due_date) <= futuro
      )
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    let html = '';

    if (upcomingTareas.length === 0) {
      html = '<p style="color: #666;">✓ No hay tareas próximas a vencer</p>';
    } else {
      html = upcomingTareas.map(t => {
        const dueDateFormatted = new Date(t.due_date).toLocaleDateString('es-ES', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        return `
          <div style="padding: 0.75rem; border-left: 3px solid #f59e0b; background: #fef3c7; border-radius: 0.25rem; margin-bottom: 0.5rem;">
            <strong>${this.escapeHTML(t.title)}</strong>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">📅 ${dueDateFormatted}</div>
          </div>
        `;
      }).join('');
    }

    document.getElementById('dashboard-upcoming').innerHTML = html;
  }

  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    this.notificationsContainer.appendChild(notification);

    if (duration > 0) {
      setTimeout(() => {
        notification.remove();
      }, duration);
    }

    return notification;
  }

  showModal(content) {
    this.modalBody.innerHTML = content;
    this.modal.style.display = 'flex';
  }

  closeModal() {
    this.modal.style.display = 'none';
    this.modalBody.innerHTML = '';
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  updateAdminElements(isAdmin) {
    const adminMenus = document.querySelectorAll('[id*="admin-menu"]');
    adminMenus.forEach(menu => {
      menu.style.display = isAdmin ? 'block' : 'none';
    });
  }

  populateUserFilter(usuarios) {
    this.filterUserAdmin.innerHTML = '<option value="">Filtrar por usuario...</option>';

    usuarios.forEach(usuario => {
      const option = document.createElement('option');
      option.value = usuario.id;
      option.textContent = usuario.username;
      this.filterUserAdmin.appendChild(option);
    });
  }

  disableButton(btn) {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  }

  enableButton(btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
  }

  validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('invalid');
        isValid = false;
      } else {
        input.classList.remove('invalid');
      }
    });

    return isValid;
  }

  clearFormErrors(form) {
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.style.display = 'none');
  }

  showFieldError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }
}

const dom = new DOMManager();
