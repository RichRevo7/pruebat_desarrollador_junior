/**
 * ===============================================
 * MÓDULO DE AUTENTICACIÓN - AuthManager
 * ===============================================
 * 
 * Descripción:
 *   Gestor de autenticación y control de permisos.
 *   Valida credenciales, mantiene sesiones activas
 *   y verifica permisos según el rol del usuario.
 * 
 * Roles Disponibles:
 *   - Administrador: acceso completo, gestión de usuarios
 *   - Usuario: acceso básico, solo sus propias tareas
 * 
 * Funcionalidades:
 *   - Login y logout de usuarios
 *   - Validación de credenciales
 *   - Gestión de sesión actual
 *   - Control de permisos basado en roles
 *   - Cambio de contraseña
 *   - Obtención de información de usuario completa
 * 
 * Permisos Controlados:
 *   - Ver todas las tareas (solo admin)
 *   - Editar/eliminar tareas de otros (solo admin)
 *   - Gestionar usuarios (solo admin)
 *   - Generar reportes (solo admin)
 *   - Crear/editar/eliminar sus propias tareas (todos)
 */

class AuthManager {
  constructor() {
    this.currentUser = storage.getCurrentSession();

    /**
     * Matriz de permisos por rol
     * Define qué acciones puede realizar cada tipo de usuario
     */
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


  /**
   * login(username, password)
   * Autentica un usuario validando credenciales
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {boolean} - true si auth es exitosa
   * @throws {Error} - Si credenciales son inválidas
   */
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

  /**
   * hasPermiso(permiso)
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permiso - Nombre del permiso a verificar
   * @returns {boolean} - true si tiene el permiso
   */
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

  /**
   * canEditarTarea(tareaUserId)
   * Verifica si el usuario puede editar una tarea específica
   * @param {number} tareaUserId - ID del usuario propietario de la tarea
   * @returns {boolean} - true si puede editar
   */
  canEditarTarea(tareaUserId) {
    const currentUserId = this.currentUser?.userId;

    // Admin puede editar cualquier tarea
    if (this.hasPermiso('editar_tareas_otros')) {
      return true;
    }

    // Usuarios solo pueden editar sus propias tareas
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


  /**
   * getPermisos()
   * Obtiene la matriz de permisos para el rol actual
   * @returns {Object} - Objeto con permisos del rol
   */
  getPermisos() {
    if (!this.isAuthenticated()) {
      return null;
    }

    const role = this.getCurrentRole();
    return this.ROLES_PERMISOS[role] || {};
  }

  /**
   * getFullUserInfo()
   * Obtiene información completa del usuario incluyendo estadísticas y permisos
   * @returns {Object|null} - Información completa del usuario o null
   */
  getFullUserInfo() {
    if (!this.isAuthenticated()) {
      return null;
    }

    // Obtiene datos del usuario
    const usuario = storage.getUsuarioById(this.currentUser.userId);
    // Obtiene estadísticas de tareas
    const stats = storage.getEstadisticasUsuario(this.currentUser.userId);

    // Retorna información consolidada
    return {
      ...this.currentUser,
      ...stats,
      permisos: this.getPermisos()
    };
  }

  /**
   * validateCredentials(username, password)
   * Valida credenciales sin hacer login
   * Útil para verificar datos sin crear sesión
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {boolean} - true si credenciales son válidas
   */
  validateCredentials(username, password) {
    try {
      // Busca el usuario
      const usuario = storage.getUsuarioByUsername(username);
      // Compara contraseña
      if (!usuario || usuario.password !== password) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * changePassword(newPassword)
   * Cambia la contraseña del usuario autenticado actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {boolean} - true si se cambió exitosamente
   * @throws {Error} - Si no está autenticado
   */
  changePassword(newPassword) {
    if (!this.isAuthenticated()) {
      throw new Error('Debes estar autenticado');
    }

    // Obtiene todos los usuarios
    const usuarios = storage.getAllUsuarios();
    // Busca el índice del usuario actual
    const index = usuarios.findIndex(u => u.id === this.currentUser.userId);

    if (index !== -1) {
      // Actualiza la contraseña
      usuarios[index].password = newPassword;
      // Persiste el cambio
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
