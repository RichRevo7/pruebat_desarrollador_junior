/**
 * ===============================================
 * MÓDULO DE ALMACENAMIENTO - StorageManager
 * ===============================================
 * 
 * Descripción:
 *   Gestor de datos persistente usando localStorage.
 *   Maneja usuarios, tareas y sesiones.
 *   Proporciona métodos CRUD para todas las entidades.
 * 
 * Funcionalidades:
 *   - Almacenamiento de usuarios y tareas
 *   - Gestión de sesión del usuario actual
 *   - CRUD de tareas (crear, leer, actualizar, eliminar)
 *   - CRUD de usuarios (admin)
 *   - Cálculo de estadísticas
 *   - Sistema de eventos (emit/on)
 *   - Filtrado y búsqueda de tareas
 *   - Validaciones de datos
 * 
 * Datos Almacenados:
 *   - USUARIOS: datos de todos los usuarios
 *   - TAREAS: todas las tareas del sistema
 *   - USER_SESSION: sesión actual del usuario
 * 
 * Datos de Ejemplo Incluidos:
 *   - 3 usuarios de prueba (admin, juan_perez, maria_garcia)
 *   - 5 tareas de ejemplo
 */

class StorageManager {
  constructor() {
    /**
     * Claves de almacenamiento en localStorage
     * Cada clave sin prefijo genera un nombre único
     */
    this.STORAGE_KEYS = {
      USUARIOS: 'tareas_app_usuarios',
      TAREAS: 'tareas_app_tareas',
      USER_SESSION: 'tareas_app_session',
    };

    this.DEFAULT_USUARIOS = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        role: 'Administrador',
        created_at: '2026-02-01T10:00:00'
      },
      {
        id: 2,
        username: 'juan_perez',
        password: 'password123',
        role: 'Usuario',
        created_at: '2026-02-10T14:30:00'
      },
      {
        id: 3,
        username: 'maria_garcia',
        password: 'password456',
        role: 'Usuario',
        created_at: '2026-02-15T09:15:00'
      }
    ];

    this.DEFAULT_TAREAS = [
      {
        id: 1,
        title: 'Desarrollar módulo de autenticación',
        status: 'Pendiente',
        created_at: '2026-03-01T09:00:00',
        due_date: '2026-03-05T17:00:00',
        user_id: 2
      },
      {
        id: 2,
        title: 'Revisar código del servidor',
        status: 'Completada',
        created_at: '2026-02-25T10:00:00',
        due_date: '2026-03-02T18:00:00',
        user_id: 2
      },
      {
        id: 3,
        title: 'Diseñar UI de dashboard',
        status: 'Pendiente',
        created_at: '2026-02-28T14:00:00',
        due_date: '2026-03-07T17:00:00',
        user_id: 3
      },
      {
        id: 4,
        title: 'Testing de formularios',
        status: 'Pendiente',
        created_at: '2026-03-01T11:00:00',
        due_date: '2026-03-04T15:00:00',
        user_id: 3
      },
      {
        id: 5,
        title: 'Configurar base de datos',
        status: 'Pendiente',
        created_at: '2026-02-20T08:00:00',
        due_date: '2026-03-06T12:00:00',
        user_id: 1
      }
    ];

    this.initializeStorage();
  }

  initializeStorage() {
    if (!localStorage.getItem(this.STORAGE_KEYS.USUARIOS)) {
      localStorage.setItem(
        this.STORAGE_KEYS.USUARIOS,
        JSON.stringify(this.DEFAULT_USUARIOS)
      );
    }

    if (!localStorage.getItem(this.STORAGE_KEYS.TAREAS)) {
      localStorage.setItem(
        this.STORAGE_KEYS.TAREAS,
        JSON.stringify(this.DEFAULT_TAREAS)
      );
    }
  }


  getAllUsuarios() {
    const data = localStorage.getItem(this.STORAGE_KEYS.USUARIOS);
    return data ? JSON.parse(data) : [];
  }

  getUsuarioByUsername(username) {
    const usuarios = this.getAllUsuarios();
    return usuarios.find(u => u.username === username) || null;
  }

  getUsuarioById(id) {
    const usuarios = this.getAllUsuarios();
    return usuarios.find(u => u.id === id) || null;
  }

  createUsuario(usuarioData) {
    const usuarios = this.getAllUsuarios();
    
    if (usuarios.some(u => u.username === usuarioData.username)) {
      throw new Error('El usuario ya existe');
    }

    const nuevoUsuario = {
      id: Math.max(...usuarios.map(u => u.id), 0) + 1,
      username: usuarioData.username,
      password: usuarioData.password,
      role: usuarioData.role || 'Usuario',
      created_at: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem(this.STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));

    this.emit('usuario:creado', nuevoUsuario);

    return nuevoUsuario;
  }

  updateUsuario(usuarioData) {
    if (!usuarioData.id) {
      throw new Error('El usuario debe incluir un ID');
    }

    const usuarios = this.getAllUsuarios();
    const index = usuarios.findIndex(u => u.id === usuarioData.id);

    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }

    usuarios[index] = { ...usuarios[index], ...usuarioData };
    localStorage.setItem(this.STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));

    this.emit('usuario:actualizado', usuarios[index]);

    return usuarios[index];
  }

  deleteUsuario(usuarioId) {
    const usuarios = this.getAllUsuarios();
    const index = usuarios.findIndex(u => u.id === usuarioId);

    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }

    const usuarioEliminado = usuarios[index];
    usuarios.splice(index, 1);
    localStorage.setItem(this.STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));

    this.emit('usuario:eliminado', usuarioEliminado);

    return true;
  }


  /**
   * getAllTareas()
   * Obtiene todas las tareas del almacenamiento
   * @returns {Array} - Array de tareas
   */
  getAllTareas() {
    const data = localStorage.getItem(this.STORAGE_KEYS.TAREAS);
    return data ? JSON.parse(data) : [];
  }

  /**
   * getTareasByUsuario(userId)
   * Obtiene todas las tareas de un usuario específico
   * @param {number} userId - ID del usuario
   * @returns {Array} - Array de tareas del usuario
   */
  getTareasByUsuario(userId) {
    const tareas = this.getAllTareas();
    return tareas.filter(t => t.user_id === userId);
  }

  getTareaById(id) {
    const tareas = this.getAllTareas();
    return tareas.find(t => t.id === id) || null;
  }

  /**
   * createTarea(tareaData)
   * Crea una nueva tarea
   * @param {Object} tareaData - Datos de la tarea
   * @returns {Object} - Tarea creada
   * @throws {Error} - Si la fecha es pasada o hay validación error
   */
  createTarea(tareaData) {
    const tareas = this.getAllTareas();

    const now = new Date();
    const dueDate = new Date(tareaData.due_date);

    // Valida que la fecha de vencimiento no sea en el pasado
    if (dueDate < now) {
      throw new Error('La fecha de vencimiento no puede ser en el pasado');
    }

    const nuevaTarea = {
      id: Math.max(...tareas.map(t => t.id), 0) + 1,
      title: tareaData.title,
      status: tareaData.status || 'Pendiente',
      created_at: new Date().toISOString(),
      due_date: tareaData.due_date,
      user_id: tareaData.user_id
    };

    tareas.push(nuevaTarea);
    localStorage.setItem(this.STORAGE_KEYS.TAREAS, JSON.stringify(tareas));

    this.emit('tarea:creada', nuevaTarea);

    return nuevaTarea;
  }

  /**
   * updateTarea(id, actualizaciones)
   * Actualiza una tarea existente
   * @param {number} id - ID de la tarea a actualizar
   * @param {Object} actualizaciones - Campos a actualizar
   * @returns {Object} - Tarea actualizada
   * @throws {Error} - Si la tarea no existe
   */
  updateTarea(id, actualizaciones) {
    const tareas = this.getAllTareas();
    const index = tareas.findIndex(t => t.id === id);

    if (index === -1) {
      throw new Error('Tarea no encontrada');
    }

    // Fusiona los datos existentes con las actualizaciones
    const tareaActualizada = { ...tareas[index], ...actualizaciones };
    tareas[index] = tareaActualizada;

    // Persiste cambios
    localStorage.setItem(this.STORAGE_KEYS.TAREAS, JSON.stringify(tareas));

    // Emite evento de actualización
    this.emit('tarea:actualizada', tareaActualizada);

    return tareaActualizada;
  }

  /**
   * deleteTarea(id)
   * Elimina una tarea del sistema
   * @param {number} id - ID de la tarea a eliminar
   * @returns {boolean} - true si se eliminó correctamente
   * @throws {Error} - Si la tarea no existe
   */
  deleteTarea(id) {
    const tareas = this.getAllTareas();
    const index = tareas.findIndex(t => t.id === id);

    if (index === -1) {
      throw new Error('Tarea no encontrada');
    }

    const tareaEliminada = tareas[index];
    tareas.splice(index, 1);

    localStorage.setItem(this.STORAGE_KEYS.TAREAS, JSON.stringify(tareas));

    this.emit('tarea:eliminada', tareaEliminada);
  }


  /**
   * loginUsuario(username, password)
   * Autentica un usuario y crea una sesión
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Object} - Objeto de sesión
   * @throws {Error} - Si credenciales son inválidas
   */
  loginUsuario(username, password) {
    // Busca el usuario por nombre de usuario
    const usuario = this.getUsuarioByUsername(username);

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (usuario.password !== password) {
      throw new Error('Contraseña incorrecta');
    }

    // Crea objeto de sesión con información del usuario
    const session = {
      userId: usuario.id,
      username: usuario.username,
      role: usuario.role,
      loginTime: new Date().toISOString()
    };

    // Persiste la sesión en localStorage
    localStorage.setItem(this.STORAGE_KEYS.USER_SESSION, JSON.stringify(session));

    this.emit('usuario:loginExitoso', session);

    return session;
  }

  /**
   * getCurrentSession()
   * Obtiene la sesión actual del usuario desde localStorage
   * @returns {Object|null} - Objeto de sesión o null si no hay activa
   */
  getCurrentSession() {
    const session = localStorage.getItem(this.STORAGE_KEYS.USER_SESSION);
    return session ? JSON.parse(session) : null;
  }

  logoutUsuario() {
    localStorage.removeItem(this.STORAGE_KEYS.USER_SESSION);
    this.emit('usuario:logoutExitoso');
  }


  emit(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }

  on(eventName, callback) {
    const handler = (e) => callback(e.detail);
    document.addEventListener(eventName, handler);

    return () => document.removeEventListener(eventName, handler);
  }


  clearAll() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('✓ Storage limpiado completamente');
  }

  exportarDatos() {
    return {
      usuarios: this.getAllUsuarios(),
      tareas: this.getAllTareas(),
      exportadoEn: new Date().toISOString()
    };
  }

  getEstadisticasUsuario(userId) {
    const tareas = this.getTareasByUsuario(userId);
    const now = new Date();

    return {
      totalTareas: tareas.length,
      tareasPendientes: tareas.filter(t => t.status === 'Pendiente').length,
      tareasCompletadas: tareas.filter(t => t.status === 'Completada').length,
      tareasAtrasadas: tareas.filter(
        t => t.status === 'Pendiente' && new Date(t.due_date) < now
      ).length
    };
  }
}

const storage = new StorageManager();
