
class AuthManager {
  constructor() {
    this.currentUser = storage.getCurrentSession();

    this.ROLES_PERMISOS = {
      'Administrador': {
        ver_todas_tareas: true,
        editar_tareas_otros: true,
        eliminar_tareas_otros: true,
        gestionar_usuarios: true,
        generar_reportes: true,
        acceso_dashboard: true,
        ver_mis_tareas: true,
        crear_tarea: true,
        editar_mi_tarea: true,
        eliminar_mi_tarea: true,
      },
      'Usuario': {
        ver_todas_tareas: false,
        editar_tareas_otros: false,
        eliminar_tareas_otros: false,
        gestionar_usuarios: false,
        generar_reportes: false,
        acceso_dashboard: true,
        ver_mis_tareas: true,
        crear_tarea: true,
        editar_mi_tarea: true,
        eliminar_mi_tarea: true,
      }
    };
  }


  login(username, password) {
    try {
      if (!username || !password) {
        throw new Error('Usuario y contraseña son requeridos');
      }

      const session = storage.loginUsuario(username, password);
      this.currentUser = session;

      return true;
    } catch (error) {
      console.error('Error en login:', error.message);
      throw error;
    }
  }

  logout() {
    storage.logoutUsuario();
    this.currentUser = null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }


  getCurrentRole() {
    return this.currentUser?.role || null;
  }

  hasPermiso(permiso) {
    if (!this.isAuthenticated()) {
      return false;
    }

    const role = this.getCurrentRole();
    const permisos = this.ROLES_PERMISOS[role];

    if (!permisos) {
      return false;
    }

    return permisos[permiso] === true;
  }

  canEditarTarea(tareaUserId) {
    const currentUserId = this.currentUser?.userId;

    if (this.hasPermiso('editar_tareas_otros')) {
      return true;
    }

    return currentUserId === tareaUserId;
  }

  canEliminarTarea(tareaUserId) {
    const currentUserId = this.currentUser?.userId;

    if (this.hasPermiso('eliminar_tareas_otros')) {
      return true;
    }

    return currentUserId === tareaUserId;
  }

  canVerTodosTareas() {
    return this.hasPermiso('ver_todas_tareas');
  }

  isAdmin() {
    return this.getCurrentRole() === 'Administrador';
  }


  requireAuth() {
    if (!this.isAuthenticated()) {
      throw new Error('Debes estar autenticado para acceder a esto');
    }
  }

  requireAdmin() {
    this.requireAuth();
    if (!this.isAdmin()) {
      throw new Error('No tienes permisos para acceder a esto');
    }
  }

  requirePermiso(permiso) {
    this.requireAuth();
    if (!this.hasPermiso(permiso)) {
      throw new Error(`No tienes permiso para: ${permiso}`);
    }
  }


  getPermisos() {
    if (!this.isAuthenticated()) {
      return null;
    }

    const role = this.getCurrentRole();
    return this.ROLES_PERMISOS[role] || {};
  }

  getFullUserInfo() {
    if (!this.isAuthenticated()) {
      return null;
    }

    const usuario = storage.getUsuarioById(this.currentUser.userId);
    const stats = storage.getEstadisticasUsuario(this.currentUser.userId);

    return {
      ...this.currentUser,
      ...stats,
      permisos: this.getPermisos()
    };
  }

  validateCredentials(username, password) {
    try {
      const usuario = storage.getUsuarioByUsername(username);
      if (!usuario || usuario.password !== password) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  changePassword(newPassword) {
    if (!this.isAuthenticated()) {
      throw new Error('Debes estar autenticado');
    }

    const usuarios = storage.getAllUsuarios();
    const index = usuarios.findIndex(u => u.id === this.currentUser.userId);

    if (index !== -1) {
      usuarios[index].password = newPassword;
      localStorage.setItem(storage.STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
      return true;
    }

    return false;
  }

  safe(callback) {
    try {
      return callback();
    } catch (error) {
      if (error.message.includes('autenticado')) {
        console.warn('⚠️ Acceso denegado: necesitas autenticación');
      } else if (error.message.includes('permiso')) {
        console.warn('⚠️ Acceso denegado: no tienes permisos');
      }
      return null;
    }
  }
}

const auth = new AuthManager();
