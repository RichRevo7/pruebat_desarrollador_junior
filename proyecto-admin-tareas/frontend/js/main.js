/**
 * ===============================================
 * MÓDULO PRINCIPAL - TaskManagerApp
 * ===============================================
 * 
 * Descripción:
 *   Clase principal que gestiona toda la aplicación.
 *   Coordina la inicialización, autenticación,
 *   navegación y operaciones CRUD de tareas.
 * 
 * Funcionalidades:
 *   - Autenticación de usuarios
 *   - Carga condicional (login vs app)
 *   - Gestión de vistas (dashboard, tareas, usuarios)
 *   - Manejo de eventos globales
 *   - Sincronización de datos
 *   - Control de roles y permisos
 * 
 * Componentes Dependientes:
 *   - class AuthManager (auth.js)
 *   - class StorageManager (storage.js)
 *   - class DOMManager (dom.js)
 */

class TaskManagerApp {
  constructor() {
    console.log('🚀 Inicializando TaskManager...');
    this.init();
  }

  /**
   * init()
   * Inicialización de la aplicación
   * Verifica autenticación y carga la vista correspondiente
   */
  init() {
    // Si ya existe sesión, carga la app, sino muestra login
    if (auth.isAuthenticated()) {
      this.loadAuthenticatedApp();
    } else {
      this.loadLoginScreen();
    }

    // Configura todos los listeners de eventos
    this.setupEventListeners();

    console.log('✓ Aplicación inicializada');
  }

  /**
   * loadLoginScreen()
   * Carga y muestra la pantalla de inicio de sesión
   */
  loadLoginScreen() {
    dom.showLoginScreen();
    console.log('📋 Pantalla de login cargada');
  }

  /**
   * loadAuthenticatedApp()
   * Carga la aplicación principal para usuario autenticado
   * - Obtiene información del usuario
   * - Muestra elementos según permisos
   * - Carga dashboard
   */
  loadAuthenticatedApp() {
    dom.showApp();
    
    const user = auth.getCurrentUser();
    dom.updateUserInfo(user);
    dom.updateAdminElements(auth.isAdmin());
    dom.switchView('dashboard');
    this.refreshDashboard();
    this.loadUsersForFilter();

    console.log(`✓ Aplicación cargada para ${user.username}`);
  }

  setupEventListeners() {
    this.setupAuthListeners();
    this.setupNavigationListeners();
    this.setupTaskListeners();
    this.setupStorageListeners();
    this.setupModalListeners();
  }

  setupAuthListeners() {
    dom.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    dom.logoutBtn.addEventListener('click', () => {
      this.handleLogout();
    });
  }

  setupNavigationListeners() {
    dom.navItems.forEach(navItem => {
      navItem.addEventListener('click', () => {
        const viewName = navItem.dataset.view;
        dom.switchView(viewName);
        switch (viewName) {
          case 'dashboard':
            this.refreshDashboard();
            break;
          case 'mis-tareas':
            this.loadUserTasks();
            break;
          case 'todas-tareas':
            this.loadAllTasks();
            break;
          case 'usuarios':
            this.loadUsers();
            break;
        }
      });
    });
  }

  setupTaskListeners() {
    dom.addTaskBtn.addEventListener('click', () => {
      dom.showTaskForm();
    });
    dom.cancelTaskBtn.addEventListener('click', () => {
      dom.hideTaskForm();
    });
    if (dom.addUserBtn) {
      dom.addUserBtn.addEventListener('click', () => {
        this.handleShowUserForm();
      });
    }

    dom.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSaveTask();
    });
    dom.filterStatus.addEventListener('change', () => {
      this.loadUserTasks(true);
    });
    dom.searchTasks.addEventListener('input', () => {
      this.loadUserTasks(true);
    });
    dom.tasksList.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-task-btn')) {
        const taskId = parseInt(e.target.dataset.id);
        this.handleEditTask(taskId);
      } else if (e.target.classList.contains('delete-task-btn')) {
        const taskId = parseInt(e.target.dataset.id);
        this.handleDeleteTask(taskId);
      } else if (e.target.classList.contains('complete-task-btn')) {
        const taskId = parseInt(e.target.dataset.id);
        this.handleCompleteTask(taskId);
      }
    });
    dom.tasksTable.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-task-btn')) {
        const taskId = parseInt(e.target.dataset.id);
        this.handleEditTask(taskId);
      } else if (e.target.classList.contains('delete-task-btn')) {
        const taskId = parseInt(e.target.dataset.id);
        this.handleDeleteTask(taskId);
      }
    });
    if (dom.filterUserAdmin) {
      dom.filterUserAdmin.addEventListener('change', () => {
        this.loadAllTasks(true);
      });
    }

    if (document.getElementById('filter-status-admin')) {
      document.getElementById('filter-status-admin').addEventListener('change', () => {
        this.loadAllTasks(true);
      });
    }

    const usersTable = document.getElementById('users-table');
    if (usersTable) {
      usersTable.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-action');
        if (btn) {
          const action = btn.dataset.action;
          const userId = parseInt(btn.dataset.userId);
          
          if (action === 'edit') {
            this.handleEditUser(userId);
          } else if (action === 'password') {
            this.handleChangePassword(userId);
          } else if (action === 'delete') {
            this.handleDeleteUser(userId);
          }
        }
      });
    }

    document.querySelectorAll('[data-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const modal = document.getElementById(targetId);
        if (modal) {
          modal.style.display = 'none';
        }
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.parentElement.style.display = 'none';
        }
      });
    });

    const btnSaveUser = document.getElementById('btn-save-user');
    if (btnSaveUser) {
      btnSaveUser.addEventListener('click', () => {
        this.handleSaveUserChanges();
      });
    }

    const btnSavePassword = document.getElementById('btn-save-password');
    if (btnSavePassword) {
      btnSavePassword.addEventListener('click', () => {
        this.handleSavePasswordChange();
      });
    }

    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener('click', () => {
        this.handleConfirmDelete();
      });
    }
  }

  setupStorageListeners() {
    storage.on('tarea:creada', (tarea) => {
      console.log('📝 Nueva tarea creada:', tarea.title);
      dom.showNotification('✓ Tarea creada exitosamente', 'success');
      this.loadUserTasks();
      this.refreshDashboard();
    });
    storage.on('tarea:actualizada', (tarea) => {
      console.log('✏️ Tarea actualizada:', tarea.title);
      dom.showNotification('✓ Tarea actualizada exitosamente', 'success');
      this.loadUserTasks();
      dom.hideTaskForm();
      this.refreshDashboard();
    });
    storage.on('tarea:eliminada', (tarea) => {
      console.log('🗑️ Tarea eliminada:', tarea.title);
      dom.showNotification('✓ Tarea eliminada exitosamente', 'warning');
      this.loadUserTasks();
      this.refreshDashboard();
    });
    storage.on('usuario:creado', (usuario) => {
      console.log('👤 Nuevo usuario creado:', usuario.username);
      dom.showNotification('✓ Usuario creado exitosamente', 'success');
    });
    storage.on('usuario:loginExitoso', (session) => {
      console.log('✓ Sesión iniciada:', session.username);
    });
  }

  setupModalListeners() {
    dom.modalClose.addEventListener('click', () => {
      dom.closeModal();
    });

    dom.modal.addEventListener('click', (e) => {
      if (e.target === dom.modal) {
        dom.closeModal();
      }
    });
  }

  /**
   * handleLogin()
   * Procesa el inicio de sesión de un usuario
   * Valida credenciales y carga la aplicación
   */
  handleLogin() {
    // Obtiene valores del formulario
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Valida que ambos campos tengan contenido
    if (!username || !password) {
      dom.showNotification('Usuario y contraseña son requeridos', 'error');
      return;
    }

    try {
      // Intenta autenticar el usuario
      auth.login(username, password);
      dom.showNotification(`✓ Bienvenido ${username}`, 'success');
      // Carga la aplicación completamente
      this.loadAuthenticatedApp();
    } catch (error) {
      console.error('Error en login:', error.message);
      dom.showNotification(`❌ ${error.message}`, 'error');
    }
  }

  /**
   * handleLogout()
   * Procesa el cierre de sesión
   * Confirma con el usuario y limpia la aplicación
   */
  handleLogout() {
    // Confirma la acción del usuario
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      // Cierra la sesión
      auth.logout();
      dom.showNotification('✓ Sesión cerrada', 'info');
      // Limpia interfaz
      dom.tasksList.innerHTML = '';
      dom.hideTaskForm();
      // Vuelve a login
      this.loadLoginScreen();
    }
  }

  /**
   * handleSaveTask()
   * Procesa la creación o actualización de una tarea
   * Valida datos y persiste en almacenamiento
   */
  handleSaveTask() {
    // Obtiene datos del formulario
    const formData = dom.getTaskFormData();

    // Valida campos requeridos
    if (!formData.title.trim() || !formData.due_date) {
      dom.showNotification('Todos los campos son requeridos', 'error');
      return;
    }

    try {
      const userId = auth.getCurrentUser().userId;

      // Si tiene ID, es actualización; si no, es creación
      if (formData.id) {
        auth.requirePermiso('editar_mi_tarea');
        const tarea = storage.getTareaById(parseInt(formData.id));

        if (!auth.canEditarTarea(tarea.user_id)) {
          throw new Error('No tienes permiso para editar esta tarea');
        }

        storage.updateTarea(parseInt(formData.id), {
          title: formData.title,
          due_date: formData.due_date,
          status: formData.status
        });
      } else {
        auth.requirePermiso('crear_tarea');
        storage.createTarea({
          title: formData.title,
          due_date: formData.due_date,
          status: formData.status,
          user_id: userId
        });
      }
    } catch (error) {
      console.error('Error al guardar tarea:', error.message);
      dom.showNotification(`❌ ${error.message}`, 'error');
    }
  }

  handleEditTask(taskId) {
    const tarea = storage.getTareaById(taskId);

    if (!tarea) {
      dom.showNotification('Tarea no encontrada', 'error');
      return;
    }

    if (!auth.canEditarTarea(tarea.user_id)) {
      dom.showNotification('No tienes permisos para editar esta tarea', 'error');
      return;
    }

    dom.editTaskForm(tarea);
  }

  handleDeleteTask(taskId) {
    const tarea = storage.getTareaById(taskId);

    if (!tarea) {
      dom.showNotification('Tarea no encontrada', 'error');
      return;
    }

    if (!auth.canEliminarTarea(tarea.user_id)) {
      dom.showNotification('No tienes permisos para eliminar esta tarea', 'error');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar la tarea: "${tarea.title}"?`)) {
      try {
        storage.deleteTarea(taskId);
      } catch (error) {
        dom.showNotification(`❌ ${error.message}`, 'error');
      }
    }
  }

  handleCompleteTask(taskId) {
    const tarea = storage.getTareaById(taskId);

    if (!tarea) {
      dom.showNotification('Tarea no encontrada', 'error');
      return;
    }

    if (!auth.canEditarTarea(tarea.user_id)) {
      dom.showNotification('No tienes permisos para modificar esta tarea', 'error');
      return;
    }

    try {
      storage.updateTarea(taskId, { status: 'Completada' });
    } catch (error) {
      dom.showNotification(`❌ ${error.message}`, 'error');
    }
  }

  handleShowUserForm() {
    if (!auth.isAdmin()) {
      dom.showNotification('No tienes permisos para crear usuarios', 'error');
      return;
    }

    const content = `
      <h2>📝 Crear Nuevo Usuario</h2>
      <form id="user-form" style="margin-top: 2rem;">
        <div class="form-group">
          <label for="user-username">Nombre de Usuario</label>
          <input 
            type="text" 
            id="user-username" 
            name="username" 
            placeholder="ej: juan_perez"
            required
            minlength="3"
          >
        </div>

        <div class="form-group">
          <label for="user-password">Contraseña</label>
          <input 
            type="password" 
            id="user-password" 
            name="password" 
            placeholder="Mínimo 6 caracteres"
            required
            minlength="6"
          >
        </div>

        <div class="form-group">
          <label for="user-role">Rol</label>
          <select id="user-role" name="role" required>
            <option value="Usuario">Usuario</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancel-user-btn">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            ✓ Crear Usuario
          </button>
        </div>
      </form>
    `;

    dom.showModal(content);

    const userForm = document.getElementById('user-form');
    userForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateUser();
    });

    document.getElementById('cancel-user-btn').addEventListener('click', () => {
      dom.closeModal();
    });
  }

  handleCreateUser() {
    const username = document.getElementById('user-username').value.trim();
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    if (!username || !password) {
      dom.showNotification('Usuario y contraseña son requeridos', 'error');
      return;
    }

    if (username.length < 3) {
      dom.showNotification('El usuario debe tener al menos 3 caracteres', 'error');
      return;
    }

    if (password.length < 6) {
      dom.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    const existingUser = storage.getAllUsuarios().find(u => u.username === username);
    if (existingUser) {
      dom.showNotification('Este usuario ya existe', 'error');
      return;
    }

    try {
      const newUser = {
        username: username,
        password: password,
        role: role,
        created_at: new Date().toISOString().split('T')[0]
      };

      storage.createUsuario(newUser);
      dom.closeModal();
      dom.showNotification(`✓ Usuario "${username}" creado exitosamente`, 'success');
      this.loadUsers();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      dom.showNotification(`❌ ${error.message}`, 'error');
    }
  }

  handleEditUser(userId) {
    const usuario = storage.getUsuarioById(userId);
    if (!usuario) {
      dom.showNotification('Usuario no encontrado', 'error');
      return;
    }
    this.currentEditingUserId = userId;
    document.getElementById('edit-username').value = usuario.username;
    document.getElementById('edit-role').value = usuario.role;
    document.getElementById('modal-edit-user').style.display = 'flex';
  }

  handleSaveUserChanges() {
    if (!this.currentEditingUserId) {
      dom.showNotification('Error: No hay usuario para editar', 'error');
      return;
    }

    const newRole = document.getElementById('edit-role').value;
    const usuario = storage.getUsuarioById(this.currentEditingUserId);

    if (!usuario) {
      dom.showNotification('Usuario no encontrado', 'error');
      return;
    }

    try {
      usuario.role = newRole;
      storage.updateUsuario(usuario);

      document.getElementById('modal-edit-user').style.display = 'none';
      dom.showNotification(`✓ Usuario "${usuario.username}" actualizado exitosamente`, 'success');
      this.loadUsers();
      this.currentEditingUserId = null;
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      dom.showNotification(`❌ ${error.message}`, 'error');
    }
  }

  handleChangePassword(userId) {
    const usuario = storage.getUsuarioById(userId);
    if (!usuario) {
      dom.showNotification('Usuario no encontrado', 'error');
      return;
    }

    this.currentPasswordUserId = userId;
    document.getElementById('change-username').value = usuario.username;
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-error').textContent = '';
    document.getElementById('modal-change-password').style.display = 'flex';
  }

  handleSavePasswordChange() {
    if (!this.currentPasswordUserId) {
      dom.showNotification('Error: No hay usuario seleccionado', 'error');
      return;
    }

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('password-error');
    if (!newPassword || !confirmPassword) {
      errorDiv.textContent = 'Ambos campos son requeridos';
      errorDiv.style.display = 'block';
      return;
    }

    if (newPassword.length < 6) {
      errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
      errorDiv.style.display = 'block';
      return;
    }

    if (newPassword !== confirmPassword) {
      errorDiv.textContent = 'Las contraseñas no coinciden';
      errorDiv.style.display = 'block';
      return;
    }

    const usuario = storage.getUsuarioById(this.currentPasswordUserId);
    if (!usuario) {
      dom.showNotification('Usuario no encontrado', 'error');
      return;
    }

    try {
      usuario.password = newPassword;
      storage.updateUsuario(usuario);

      document.getElementById('modal-change-password').style.display = 'none';
      dom.showNotification(`✓ Contraseña de "${usuario.username}" cambió exitosamente`, 'success');
      this.currentPasswordUserId = null;
      errorDiv.style.display = 'none';
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      dom.showNotification(`❌ ${error.message}`, 'error');
    }
  }

  handleDeleteUser(userId) {
    const usuario = storage.getUsuarioById(userId);
    if (!usuario) {
      dom.showNotification('Usuario no encontrado', 'error');
      return;
    }
    this.currentDeletingUserId = userId;
    document.getElementById('delete-username').textContent = usuario.username;
    document.getElementById('modal-delete-user').style.display = 'flex';
  }

  handleConfirmDelete() {
    if (!this.currentDeletingUserId) {
      dom.showNotification('Error: No hay usuario para eliminar', 'error');
      return;
    }

    const usuario = storage.getUsuarioById(this.currentDeletingUserId);
    if (!usuario) {
      dom.showNotification('Usuario no encontrado', 'error');
      return;
    }

    try {
      const tareas = storage.getAllTareas().filter(t => t.user_id === this.currentDeletingUserId);

      tareas.forEach(tarea => {
        storage.deleteTarea(tarea.id);
      });

      storage.deleteUsuario(this.currentDeletingUserId);

      document.getElementById('modal-delete-user').style.display = 'none';
      dom.showNotification(`✓ Usuario "${usuario.username}" eliminado exitosamente`, 'success');
      this.loadUsers();
      this.currentDeletingUserId = null;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      dom.showNotification(`❌ ${error.message}`, 'error');
    }
  }

  loadUserTasks(aplicarFiltros = false) {
    try {
      auth.requirePermiso('ver_mis_tareas');
      const userId = auth.getCurrentUser().userId;
      let tareas = storage.getTareasByUsuario(userId);
      if (aplicarFiltros) {
        const statusFilter = dom.filterStatus.value;
        const searchTerm = dom.searchTasks.value.toLowerCase();

        if (statusFilter) {
          tareas = tareas.filter(t => t.status === statusFilter);
        }

        if (searchTerm) {
          tareas = tareas.filter(t =>
            t.title.toLowerCase().includes(searchTerm)
          );
        }
      }

      tareas.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

      dom.renderUserTasks(tareas);
      dom.updateStats(userId);
    } catch (error) {
      console.error('Error al cargar tareas:', error.message);
    }
  }

  loadAllTasks(aplicarFiltros = false) {
    try {
      auth.requireAdmin();
      let tareas = storage.getAllTareas();
      if (aplicarFiltros) {
        const userFilter = dom.filterUserAdmin.value;
        const statusFilter = document.getElementById('filter-status-admin')?.value;

        if (userFilter) {
          tareas = tareas.filter(t => t.user_id === parseInt(userFilter));
        }

        if (statusFilter) {
          tareas = tareas.filter(t => t.status === statusFilter);
        }
      }

      tareas.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

      dom.renderAdminTasksTable(tareas);
    } catch (error) {
      console.error('Error al cargar tareas admin:', error.message);
      dom.showNotification('❌ No tienes permisos acceder a esta sección', 'error');
    }
  }

  loadUsers() {
    try {
      auth.requireAdmin();
      const usuarios = storage.getAllUsuarios();
      dom.renderUsersTable(usuarios);
    } catch (error) {
      console.error('Error al cargar usuarios:', error.message);
      dom.showNotification('❌ No tienes permisos acceder a esta sección', 'error');
    }
  }

  loadUsersForFilter() {
    try {
      if (auth.isAdmin()) {
        const usuarios = storage.getAllUsuarios();
        dom.populateUserFilter(usuarios);
      }
    } catch (error) {
      console.error('Error al cargar usuarios para filtro:', error.message);
    }
  }

  refreshDashboard() {
    const userId = auth.getCurrentUser().userId;
    dom.updateDashboard(userId);
    dom.updateUpcomingTasks(userId, 7);
    dom.updateStats(userId);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new TaskManagerApp();
  });
} else {
  window.app = new TaskManagerApp();
}
