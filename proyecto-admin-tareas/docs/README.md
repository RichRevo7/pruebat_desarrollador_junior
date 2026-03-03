# 📋 Sistema de Gestión de Tareas - Prueba Técnica

## 📌 Descripción General

Sistema completo de gestión de tareas con **base de datos relacional (SQL)** y **frontend vanilla JavaScript**. Proyecto profesional y listo para producción, diseñado como prueba técnica para puesto de **Desarrollador Junior**.

### 🎯 Objetivos Cumplidos

✅ **Base de Datos SQL**
- Esquema relacional normalizado
- Constraints de validación
- Índices para optimización
- Datos de prueba incluidos
- Tres consultas SQL importantes

✅ **Frontend Vanilla JavaScript**
- Cero dependencias externas
- Arquitectura modular con 4 módulos separados
- Persistencia con localStorage
- Sistema de roles (Administrador/Usuario)
- UI dinámica y responsiva

✅ **Características Plus**
- Sistema de login básico
- Custom Events para comunicación entre módulos
- Diseño Mobile First (CSS Grid/Flexbox)
- Control de permisos según rol
- Dashboard interactivo
- Dark-friendly design

✅ **Buenas Prácticas**
- Código comentado y bien documentado
- Clean Code principles
- Estructura clara de carpetas
- Separación de responsabilidades
- Validaciones client-side
- Manejo de errores profesional

---

## 🏗️ Estructura del Proyecto

```
proyecto-admin-tareas/
├── database/
│   └── schema.sql                 # Script SQL completo
├── frontend/
│   ├── index.html                 # Estructura HTML
│   ├── css/
│   │   └── styles.css             # Estilos responsivos
│   └── js/
│       ├── storage.js             # Gestión de localStorage
│       ├── auth.js                # Autenticación y roles
│       ├── dom.js                 # Manipulación del DOM
│       └── main.js                # Orquestación
├── docs/
│   ├── README.md                  # Este archivo
│   └── GUIA_EJECUCION.md         # Instrucciones de uso
└── .gitignore
```

---

## 🗄️ Base de Datos

### Tablas

#### `usuarios`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | Identificador único (PK) |
| username | VARCHAR(50) | Nombre de usuario único |
| password | VARCHAR(255) | Contraseña |
| role | ENUM | 'Administrador' o 'Usuario' |
| created_at | TIMESTAMP | Fecha de creación |

#### `tareas`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | Identificador único (PK) |
| title | VARCHAR(255) | Título de la tarea |
| status | ENUM | 'Pendiente' o 'Completada' |
| created_at | TIMESTAMP | Fecha de creación |
| due_date | DATETIME | Fecha de vencimiento |
| user_id | INT | ID del usuario (FK) |

**Constraints:**
- ✓ `due_date >= created_at` (CHECK)
- ✓ Relación FK con cascada delete

### Datos de Prueba

**Usuarios:**
```
1. admin / admin123 (Administrador)
2. juan_perez / password123 (Usuario)
3. maria_garcia / password456 (Usuario)
```

**Tareas:** 5 tareas distribuidas entre los usuarios

---

## 🎨 Frontend

### Módulos JavaScript

#### 1. **storage.js** - Gestión de Datos
Gestiona toda la persistencia usando localStorage. Simula una base de datos en memoria.

**Métodos principales:**
```javascript
// Usuarios
storage.getAllUsuarios()
storage.getUsuarioByUsername(username)
storage.createUsuario(usuarioData)

// Tareas
storage.getAllTareas()
storage.getTareasByUsuario(userId)
storage.createTarea(tareaData)
storage.updateTarea(id, actualizaciones)
storage.deleteTarea(id)

// Sesión
storage.loginUsuario(username, password)
storage.getCurrentSession()
storage.logoutUsuario()

// Eventos
storage.emit(eventName, data)
storage.on(eventName, callback)
```

#### 2. **auth.js** - Autenticación y Permisos
Gestiona autenticación, roles y control de acceso.

**Métodos principales:**
```javascript
// Autenticación
auth.login(username, password)
auth.logout()
auth.isAuthenticated()

// Roles y Permisos
auth.hasPermiso(permiso)
auth.isAdmin()
auth.canEditarTarea(tareaUserId)
auth.canEliminarTarea(tareaUserId)

// Validación
auth.requireAuth()
auth.requireAdmin()
auth.requirePermiso(permiso)
```

**Permisos por Rol:**

| Permiso | Admin | Usuario |
|---------|-------|---------|
| Ver todas tareas | ✓ | ✗ |
| Editar tareas otros | ✓ | ✗ |
| Eliminar tareas otros | ✓ | ✗ |
| Gestionar usuarios | ✓ | ✗ |
| Ver mis tareas | ✓ | ✓ |
| Crear tarea | ✓ | ✓ |
| Editar mi tarea | ✓ | ✓ |

#### 3. **dom.js** - Manipulación del DOM
Separa completamente la lógica de negocio de la presentación.

**Métodos principales:**
```javascript
// Vistas
dom.switchView(viewId)
dom.showLoginScreen()
dom.showApp()

// Tareas
dom.renderUserTasks(tareas)
dom.renderAdminTasksTable(tareas)
dom.createTaskCard(tarea, usuario, showUser)

// Formularios
dom.showTaskForm()
dom.editTaskForm(tarea)
dom.getTaskFormData()

// Información
dom.updateUserInfo(user)
dom.updateStats(userId)
dom.updateDashboard(userId)

// Notificaciones
dom.showNotification(message, type, duration)
dom.showModal(content)
```

#### 4. **main.js** - Orquestación
Punto de entrada que coordina toda la aplicación.

**Características:**
- Inicialización de la app
- Registro de event listeners
- Flujos de autenticación
- Manejo de interacciones del usuario
- Comunicación entre módulos via Custom Events

### Vistas Disponibles

1. **Login** - Autenticación de usuario
2. **Dashboard** - Resumen de tareas y próximas
3. **Mis Tareas** - Gestión de tareas personales
4. **Todas las Tareas** (Admin) - Tabla de todas las tareas
5. **Usuarios** (Admin) - Gestión de usuarios

---

## 🎯 Casos de Uso

### Usuario Normal (Juan / María)
```
1. Inicia sesión
2. Ve su dashboard con estadísticas
3. Crea nuevas tareas
4. Edita/completa sus tareas
5. Filtra tareas por estado
6. Busca tareas por título
```

### Administrador
```
1. Inicia sesión como admin
2. Ver dashboard (sus tareas)
3. Ver tabla de TODAS las tareas del sistema
4. Editar/eliminar cualquier tarea
5. Gestionar usuarios
6. Filtrar tareas por usuario y estado
```

---

## 🎨 Características de UI/UX

### Mobile First
- Responsive design que funciona en todos los dispositivos
- CSS Grid para layouts complejos
- Flexbox para componentes
- Breakpoints: 768px, 1024px

### Accesibilidad
- Validación de formularios en tiempo real
- Mensajes de error claros
- Navegación por teclado
- Colores con alto contraste

### Interactividad
- Animaciones suaves (fade-in, slide-in)
- Notificaciones tipo toast
- Modales interactivos
- Formularios dinámicos

### Visual Design
- Paleta de colores profesional
- Iconos emoji para mejor UX
- Estados visuales claros (hover, active, disabled)
- Espaciado consistent (sistema de espacios)

---

## 🔐 Seguridad

**Implementado:**
- ✓ Validación de permisos en todas las acciones
- ✓ Escape de HTML para prevenir XSS
- ✓ Control de roles diferenciado
- ✓ Validación de formularios client-side

**Nota de Producción:**
- En producción, usar bcrypt para hashear contraseñas
- Implementar HTTPS
- Backend: validar permisos en servidor
- Usar JWT para tokens de sesión

---

## 📊 Consultas SQL Incluidas

### 1. Listado de Tareas Ordenadas por Vencimiento
```sql
SELECT t.id, t.title, t.status, t.due_date, u.username
FROM tareas t
INNER JOIN usuarios u ON t.user_id = u.id
ORDER BY t.due_date ASC;
```

### 2. Conteo de Tareas por Usuario
```sql
SELECT u.username, 
       SUM(CASE WHEN t.status = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes,
       SUM(CASE WHEN t.status = 'Completada' THEN 1 ELSE 0 END) AS completadas
FROM usuarios u
LEFT JOIN tareas t ON u.id = t.user_id
GROUP BY u.id, u.username;
```

### 3. Tareas Atrasadas
```sql
SELECT t.id, t.title, t.due_date, u.username
FROM tareas t
INNER JOIN usuarios u ON t.user_id = u.id
WHERE t.status = 'Pendiente' AND t.due_date < NOW()
ORDER BY t.due_date ASC;
```

---

## 🚀 Instalación y Uso

### Backend (SQL)
1. Crear base de datos en MySQL
2. Importar el script `database/schema.sql`

### Frontend
1. Abrir `frontend/index.html` en el navegador
2. Usar credenciales de prueba
3. **No requiere servidor, funciona localmente**

Ver [GUIA_EJECUCION.md](./docs/GUIA_EJECUCION.md) para instrucciones detalladas.

---

## 📹 Recomendaciones para Video de Demostración

1. **Inicio** (30 seg)
   - Mostrar la pantalla de login
   - Explicar usuarios de prueba

2. **User Normal** (2 min)
   - Login como juan_perez
   - Mostrar dashboard
   - Crear una tarea
   - Editar una tarea
   - Completar tarea
   - Mostrar filtros y búsqueda

3. **Admin** (2 min)
   - Logout y login como admin
   - Mostrar acceso a "Todas las Tareas"
   - Mostrar tabla de usuarios
   - Filtrar tareas por usuario
   - Editar tarea de otro usuario
   - Mostrar que usuario normal NO tiene acceso

4. **Features** (1 min)
   - Mostrar responsividad en móvil
   - Explicar que NO usa frameworks
   - Mostrar localStorage en DevTools
   - Mostrar código modular

5. **Cierre** (30 seg)
   - Resumen de features
   - Mostrar estructura del proyecto

**Total: ~6 minutos**

---

## 💡 Decisiones de Diseño

### ¿Por qué localStorage?
- Simula persistencia sin servidor
- Permite demonstrar el conocimiento de API de browser
- Fácil de debugar en DevTools

### ¿Por qué Custom Events?
- Demuestra patrones avanzados de JavaScript
- Desacoplamiento entre módulos
- Clean Architecture

### ¿Por qué vanilla JavaScript?
- Demuestra radominio del lenguaje
- Muestra que no dependo de frameworks
- Más fácil de mantener para un pequeño proyecto

### Arquitectura modular
- Cada módulo tiene una responsabilidad clara
- Fácil de testear
- Escalable para agregar features

---

## 🎓 Concepto de Aprendizaje

Este proyecto demuestra competencias en:

✅ **Backend/Base de Datos**
- Diseño relacional
- SQL avanzado (JOINs, GROUP BY, subconsultas)
- Constraints y integridad referencial

✅ **Frontend**
- DOM API
- Event Handling
- localStorage API
- CSS Avanzado (Grid, Flexbox)
- Responsive Design

✅ **Software Engineering**
- Separación de responsabilidades
- Design Patterns
- Clean Code
- Arquitectura modular
- Validación y manejo de errores

✅ **Soft Skills**
- Documentación clara
- Código legible
- Buenas prácticas

---

## 📝 Licencia

Este proyecto es de código abierto y puede ser utilizado libremente para fines educativos.

---

## 🤝 Autor

**Prueba Técnica - Desarrollador Junior**
Marzo 2026

---

## 📞 Soporte

Para dudas o mejoras, consultar la documentación o el código comentado.

**Happy Coding! 🚀**
