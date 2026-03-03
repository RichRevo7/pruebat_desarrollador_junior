# 🏛️ Arquitectura del Código - Documentación Técnica

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                    APLICACIÓN FRONTEND                          │
│                  (TaskManagerApp - main.js)                     │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │ AuthManager  │    │ StorageManager│   │  DOMManager  │
    │ (auth.js)    │    │ (storage.js)  │   │  (dom.js)    │
    └──────────────┘    └──────────────┘    └──────────────┘
           │                    │                    │
           └────────┬───────────┴────────┬───────────┘
                    │                    │
              ┌─────▼─────┐        ┌────▼──────┐
              │ localStorage│       │   HTML DOM │
              │ (Datos)     │       │ (Interfaz) │
              └─────────────┘       └───────────┘
```

---

## 📋 Estructura de Capas

### Capa 1: Interfaz de Usuario (DOM)
**Responsable:** `DOMManager` (dom.js)
- Renderizar componentes
- Capturar eventos del usuario
- Actualizar interfaz visual
- Mostrar notificaciones

**Comunicación:**
```
Usuario Input → DOM Event → App Handler → Auth/Storage → DOM Update
```

---

### Capa 2: Lógica de Aplicación
**Responsable:** `TaskManagerApp` (main.js)
- Orquestar flujos
- Manejar eventos globales
- Coordinar módulos
- Control de vistas

**Flujo de Control:**
```
login → auth.login() → dom.showApp() → load dashboard
create task → storage.createTarea() → emit event → refresh UI
```

---

### Capa 3: Autenticación y Autorización
**Responsable:** `AuthManager` (auth.js)
- Validar credenciales
- Mantener sesión
- Verificar permisos
- Control de acceso

**Matrix de Decisión:**
```javascript
Acción → hasPermiso(permiso) → true/false → permitir/denegar
```

---

### Capa 4: Persistencia de Datos
**Responsable:** `StorageManager` (storage.js)
- CRUD de usuarios
- CRUD de tareas
- Gestión de sesiones
- Eventos de cambios

**Almacenamiento:**
```
localStorage
├── tareas_app_usuarios
├── tareas_app_tareas
└── tareas_app_session
```

---

## 🔄 Flujos de Datos Principales

### Flujo 1: Autenticación
```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario ingresa credenciales en formulario login     │
└────────────────────┬────────────────────────────────────┘
                     │ DOM Event: loginForm.submit()
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. app.handleLogin()                                    │
│    - Valida campos requeridos                           │
│    - Llama auth.login(username, password)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. auth.login()                                         │
│    - Llama storage.loginUsuario()                       │
│    - Valida credenciales                                │
│    - Crea sesión                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. storage.loginUsuario()                               │
│    - Busca usuario en localStorage                      │
│    - Valida contraseña                                  │
│    - Guarda sesión en localStorage                      │
│    - Emite evento 'usuario:loginExitoso'                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. app.loadAuthenticatedApp()                           │
│    - Obtiene información del usuario                    │
│    - Muestra elementos según permisos                   │
│    - Carga dashboard                                    │
│    - Actualiza DOM                                      │
└─────────────────────────────────────────────────────────┘
```

---

### Flujo 2: Creación de Tarea
```
┌──────────────────────────────────────────────────────┐
│ 1. Usuario completa formulario y hace submit         │
└────────────────┬──────────────────────────────────┘
                 │ DOM Event: taskForm.submit()
                 ▼
┌──────────────────────────────────────────────────────┐
│ 2. app.handleSaveTask()                              │
│    - Valida campos requeridos                        │
│    - Obtiene datos del formulario                    │
└────────────────┬──────────────────────────────────┘
                 │
                 ├─ Si es CREACIÓN:
                 │  └─ auth.requirePermiso('crear_tarea')
                 │
                 └─ Si es ACTUALIZACIÓN:
                    └─ auth.requirePermiso('editar_mi_tarea')
                       └─ auth.canEditarTarea(tareaUserId)
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│ 3. storage.createTarea() o updateTarea()             │
│    - Valida datos                                    │
│    - Verifica fechas                                 │
│    - Guarda en localStorage                          │
│    - Emite evento                                    │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 4. app escucha evento 'tarea:creada' o actualizada   │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 5. app.loadUserTasks()                               │
│    - Obtiene tareas del usuario                      │
│    - Pasa a dom.renderUserTasks()                    │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 6. DOM se actualiza con nuevas tareas                │
│    - Muestra notificación de éxito                   │
│    - Limpia formulario                               │
│    - Oculta formulario                               │
└──────────────────────────────────────────────────────┘
```

---

### Flujo 3: Filtrado de Tareas
```
┌──────────────────────────────────────────────────────┐
│ 1. Usuario selecciona filtro (estado/usuario/busca)  │
└────────────────┬──────────────────────────────────┘
                 │ DOM Event: filterStatus.change()
                 ▼
┌──────────────────────────────────────────────────────┐
│ 2. app.loadUserTasks(true)  [con refresh=true]       │
│    - Obtiene todas las tareas del usuario            │
│    - Aplica filtros:                                 │
│      ├─ Por estado (status)                          │
│      ├─ Por búsqueda de texto                        │
│      └─ Por usuario (si admin en vista todos)        │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 3. dom.renderUserTasks() o renderAdminTasksTable()   │
│    - Limpia contenedor                               │
│    - Itera sobre tareas filtradas                    │
│    - Crea tarjeta or fila por tarea                  │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 4. DOM actualizado con resultados filtrados          │
└──────────────────────────────────────────────────────┘
```

---

## 🔐 Flujo de Control de Permisos

```
                         ┌─ Usuario intenta acción
                         │
                    ┌────▼────────┐
                    │  Validar    │
                    │  Autenticado │
                    └────┬────────┘
                         │
              ┌──────────┴──────────┐
              │ NO                  │ SÍ
              ▼                     ▼
        ┌──────────┐          ┌────────────┐
        │  DENEGAR │          │ Verificar  │
        │ Redirigir│          │ Permisos   │
        │  a Login │          │ del Rol    │
        └──────────┘          └─────┬──────┘
                                    │
                         ┌──────────┴──────────┐
                         │ NO                  │ SÍ
                         ▼                     ▼
                    ┌──────────┐        ┌────────────┐
                    │  DENEGAR │        │  PERMITIR  │
                    │  Erróra  │        │  Ejecutar  │
                    │ Acceso   │        │  Acción    │
                    └──────────┘        └────────────┘
```

---

## 📦 Dependencias Entre Módulos

### main.js (TaskManagerApp)
**Depende de:**
- auth (AuthManager)
- storage (StorageManager)
- dom (DOMManager)

**Usa métodos de:**
```
auth: login, logout, hasPermiso, getCurrentUser, isAdmin, requirePermiso
storage: getTareasByUsuario, getAllTareas, createTarea, updateTarea, deleteTarea
dom: showApp, showLoginScreen, switchView, renderUserTasks, showNotification
```

---

### auth.js (AuthManager)
**Depende de:**
- storage (para obtener datos de usuario)

**Usa métodos de:**
```
storage: getUsuarioByUsername, getUsuarioById, loginUsuario, getCurrentSession
```

**Exponentes:**
```
Variable global: const auth = new AuthManager()
Usado en: main.js, dom.js, storage.js
```

---

### storage.js (StorageManager)
**Depende de:**
- localStorage API del navegador
- No depende de otros módulos

**Métodos Externamente Accesibles:**
```
getAllUsuarios
getTareasByUsuario
createTarea
updateTarea
deleteTarea
loginUsuario
logoutUsuario
getCurrentSession
emit, on (eventos)
```

**Exponentes:**
```
Variable global: const storage = new StorageManager()
Usado en: main.js, auth.js, dom.js
```

---

### dom.js (DOMManager)
**Depende de:**
- auth (para verificar permisos)
- storage (para obtener datos de usuario)
- DOM API del navegador

**Elementos DOM Requeridos:**
```
#login-section         - Pantalla de login
#app-container         - Contenedor de aplicación
#login-form           - Formulario de login
#task-form            - Formulario de tarea
#task-form-container  - Contenedor del formulario
#tasks-list           - Lista de tareas (usuario)
#admin-tasks-table    - Tabla de tareas (admin)
#users-table          - Tabla de usuarios
.nav-item             - Elementos de navegación
.view                 - Vistas de la app
#user-info            - Info del usuario en navbar
...y muchos más
```

**Exponentes:**
```
Variable global: const dom = new DOMManager()
Usado en: main.js
```

---

## 🎛️ Sistema de Eventos (Custom Events)

### Eventos Emitidos por storage:

| Evento | Datos | Disparado por |
|--------|-------|---------------|
| `usuario:login` | session object | loginUsuario() |
| `usuario:logout` | null | logoutUsuario() |
| `usuario:creado` | usuario object | createUsuario() |
| `usuario:actualizado` | usuario object | updateUsuario() |
| `usuario:eliminado` | usuario object | deleteUsuario() |
| `tarea:creada` | tarea object | createTarea() |
| `tarea:actualizada` | tarea object | updateTarea() |
| `tarea:eliminada` | tarea object | deleteTarea() |

### Listeners en main.js:

```javascript
storage.on('tarea:creada', () => {
  this.loadUserTasks();  // Recarga la lista
});

storage.on('tarea:actualizada', () => {
  this.loadUserTasks();  // Recarga la lista
});

storage.on('tarea:eliminada', () => {
  this.loadUserTasks();  // Recarga la lista
});

storage.on('usuario:creado', () => {
  this.loadUsers();  // Recarga lista de usuarios
});
```

---

## 💾 Estructura de Datos

### Objeto Usuario
```javascript
{
  id: 1,                          // Identificador único
  username: 'admin',              // Nombre único
  password: 'admin123',           // Contraseña
  role: 'Administrador',          // Rol: 'Administrador' | 'Usuario'
  created_at: '2026-02-01T10:00:00' // Fecha ISO
}
```

### Objeto Sesión
```javascript
{
  userId: 1,                      // ID del usuario
  username: 'admin',              // Nombre del usuario
  role: 'Administrador',          // Rol del usuario
  loginTime: '2026-03-03T12:00:00' // Hora de login
}
```

### Objeto Tarea
```javascript
{
  id: 1,                          // Identificador único
  title: 'Tarea de ejemplo',      // Título
  status: 'Pendiente',            // 'Pendiente' | 'Completada'
  created_at: '2026-03-01T09:00:00',  // Fecha de creación
  due_date: '2026-03-05T17:00:00',    // Fecha de vencimiento
  user_id: 2                      // ID del usuario propietario
}
```

---

## 🎯 Puntos de Entrada

### 1. Punto de Entrada Inicial
```javascript
// En el archivo HTML, al cargar
<script src="js/storage.js"></script>
<script src="js/auth.js"></script>
<script src="js/dom.js"></script>
<script src="js/main.js"></script>

// Se crea instancia de TaskManagerApp
const app = new TaskManagerApp();
// Se llama automáticamente a constructor → init()
```

---

### 2. Flujo Iniciales de init()
```
TaskManagerApp.init()
├─ auth.isAuthenticated()
│  ├─ SI: loadAuthenticatedApp()
│  └─ NO: loadLoginScreen()
├─ setupEventListeners()
│  ├─ setupAuthListeners() → formulario login
│  ├─ setupNavigationListeners() → menú navegación
│  ├─ setupTaskListeners() → eventos de tareas
│  ├─ setupStorageListeners() → listeners de cambios
│  └─ setupModalListeners() → listeners de modal
└─ console.log('✓ Aplicación inicializada')
```

---

## 🔌 Extensibilidad

### Cómo Agregar una Nueva Funcionalidad

#### Ejemplo: Nueva rol "Supervisor"

1. **auth.js** - Agregar rol:
```javascript
this.ROLES_PERMISOS['Supervisor'] = {
  ver_todas_tareas: true,
  editar_tareas_otros: false,  // No puede editar todas
  eliminar_tareas_otros: false,
  gestionar_usuarios: false,
  generar_reportes: true,      // Puede generar reportes
  acceso_dashboard: true,
  // ... otros permisos
};
```

2. **storage.js** - Validar rol:
```javascript
createUsuario(usuarioData) {
  // Agregar validación de rol
  const rolesValidos = ['Administrador', 'Usuario', 'Supervisor'];
  if (!rolesValidos.includes(usuarioData.role)) {
    throw new Error('Rol inválido');
  }
  // ... resto del código
}
```

3. **dom.js** - Actualizar UI para nuevo rol:
```javascript
updateAdminElements(isAdmin) {
  // Agregar lógica para Supervisor
  const isSupervisor = auth.getCurrentRole() === 'Supervisor';
  // Mostrar/ocultar elementos según rol
}
```

---

## 📊 Métricas de Código

| Métrica | Valor |
|---------|-------|
| Total de funciones documentadas | 40+ |
| Total de líneas de comentarios | 630+ |
| Módulos principales | 4 |
| Clases | 4 |
| Tablas de base de datos | 2 |
| Roles de usuario | 2 |
| Niveles de permiso | 8 |
| Eventos personalizados | 8 |

---

## 🚀 Optimizaciones Aplicadas

1. **Índices en BD** - Búsquedas rápidas por usuario, estado y fecha
2. **localStorage** - Reducción de peticiones de red
3. **Renderizado selectivo** - Solo actualiza lo necesario
4. **Validaciones client-side** - Reduce errores antes de procesar
5. **Lazy loading** - Carga datos solo cuando se necesitan

---

## 🔐 Consideraciones de Seguridad

⚠️ **Importante para producción:**
- Las contraseñas se guardan en texto plano (solo para demo)
- Se debe usar HTTPS en producción
- Implementar validación server-side
- Usar JWT o sesiones seguras en servidor
- Validar permisos en servidor también
- Sanitizar entrada de usuario (XSS protection)

---

**Fecha de actualización:** Marzo 3, 2026  
**Autor:** RichRevo7  
**Estado:** ✅ Documentación Completa
