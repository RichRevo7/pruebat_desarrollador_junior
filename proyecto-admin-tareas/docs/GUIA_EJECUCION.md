# 📖 Guía de Ejecución - Sistema de Gestión de Tareas

## 🎯 Guía Rápida (3 minutos)

### Paso 1: Abrir la Aplicación
```bash
# Option 1: Abrir directamente en el navegador
# Haz clic en frontend/index.html

# Option 2: Usar un servidor local (recomendado)
cd proyecto-admin-tareas/frontend
python -m http.server 8000

# Luego abre: http://localhost:8000
```

### Paso 2: Login con Credenciales de Prueba
```
Usuario: admin
Contraseña: admin123
```

### Paso 3: ¡Listo! Explora la aplicación

---

## 🧑‍💻 Instalación Completa

### Requisitos
- ✓ Navegador moderno (Chrome, Firefox, Safari, Edge)
- ✓ MySQL (solo si quieres usar la BD real)
- ✓ Python o Node.js (para servidor local, opcional)

### Backend - Base de Datos (Opcional)

Si deseas usar MySQL en lugar de localStorage:

**1. Crear la base de datos:**
```bash
mysql -u root -p < database/schema.sql
```

**2. Configurar conexión (requeriría backend en Node/PHP):**
```
Este proyecto actual usa localStorage.
Para conectar a MySQL real, necesitarías:
- Backend en Node.js/PHP/Python
- API REST endpoints
- Validación en servidor
```

### Frontend - Aplicación Web

**1. Navega a la carpeta frontend:**
```bash
cd frontend
```

**2. Opción A: Abrir directamente**
- Haz doble clic en `index.html`
- Se abrirá en tu navegador por defecto

**3. Opción B: Servidor local con Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Luego abre: http://localhost:8000
```

**4. Opción C: Servidor local con Node.js**
```bash
# Instalar http-server (una sola vez)
npm install -g http-server

# Ejecutar
http-server

# Luego abre: http://localhost:8080
```

---

## 👥 Usuarios de Prueba

### Admin
```
Username: admin
Password: admin123
Permisos: Ver todas las tareas, gestionar usuarios, editar/eliminar de otros
```

### Usuario Normal 1
```
Username: juan_perez
Password: password123
Permisos: Solo ver y gestionar sus propias tareas
```

### Usuario Normal 2
```
Username: maria_garcia
Password: password456
Permisos: Solo ver y gestionar sus propias tareas
```

---

## 🎮 Flujo de Uso

### Para Usuarios Normales

**1. Login**
- Ingresa credenciales
- Recibirás confirmación de bienvenida

**2. Dashboard**
- Visualiza resumen de tus tareas
- Ver tareas próximas a vencer
- Estadísticas rápidas

**3. Crear Tarea**
- Click en "➕ Nueva Tarea"
- Rellena el formulario:
  - **Título**: Descripción de la tarea (requerido)
  - **Vencimiento**: Fecha y hora (requerido, futuro)
  - **Estado**: Pendiente o Completada
- Click "Guardar"

**4. Gestionar Tareas**
- **Editar**: Click en "✏️ Editar"
- **Completar**: Click en "✓ Completar"
- **Eliminar**: Click en "🗑️ Eliminar"

**5. Filtrar y Buscar**
- Dropdown "Filtrar por estado"
- Buscador por título de tarea

**6. Logout**
- Click en "Cerrar Sesión"

### Para Administrador

**Todas las acciones anteriores +**

**1. Ver Todas las Tareas**
- Menu > "👥 Todas las Tareas"
- Tabla con tareas de TODOS los usuarios

**2. Filtros Avanzados**
- Filtrar por usuario específico
- Filtrar por estado

**3. Gestionar Usuarios**
- Menu > "👤 Gestionar Usuarios"
- Ver lista de usuarios y sus estadísticas

**4. Editar Tareas de Otros**
- En tabla de "Todas las Tareas"
- Puede editar/eliminar tareas de cualquier usuario

---

## 🔧 Características Técnicas

### Persistencia de Datos

**localStorage:**
- Todos los datos se guardan en localStorage del navegador
- Persisten después de cerrar el navegador
- Se pueden exportar/importar (ver DevTools)

**Limpiar datos (en consola):**
```javascript
// Borrar todo
storage.clearAll();

// Exportar datos (hacer backup)
console.log(storage.exportarDatos());

// Re-inicializar con datos por defecto
location.reload();
```

### Custom Events

La app usa Custom Events para comunicación entre módulos:

```javascript
// Escuchar evento cuando se crea tarea
storage.on('tarea:creada', (tarea) => {
  console.log('Nueva tarea:', tarea);
});

// Emitir evento personalizado
storage.emit('mi-evento', datos);
```

### Validaciones

**Formulario:**
- ✓ Campos requeridos
- ✓ Fecha de vencimiento no puede ser en el pasado
- ✓ Títulos no vacíos

**Seguridad:**
- ✓ Control de permisos en cada acción
- ✓ Escape de HTML (prevención de XSS)
- ✓ Validación de roles

---

## 🐛 Debugging

### Abrir DevTools
```
Windows/Linux: F12 o Ctrl+Shift+I
Mac: Cmd+Option+I
```

### Console

Ver logs útiles para debugging:

```javascript
// Ver usuario actual
console.log(auth.getCurrentUser());

// Ver todas las tareas
console.log(storage.getAllTareas());

// Ver sesión guardada
console.log(auth.getFullUserInfo());

// Ver permisos
console.log(auth.getPermisos());

// Exportar todos los datos
console.log(storage.exportarDatos());
```

### Storage / Application Tab

1. **Application > Local Storage**
2. Puedes ver:
   - `tareas_app_usuarios` - Datos de usuarios
   - `tareas_app_tareas` - Datos de tareas
   - `tareas_app_session` - Sesión actual

3. Puedes editar directamente los valores JSON

---

## 📱 Responsive Design

### Tamaños de Pantalla
- **Móvil**: Hasta 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Probar en DevTools
1. Abre DevTools (F12)
2. Click en icono de dispositivo (Ctrl+Shift+M)
3. Selecciona dispositivo o tamaño personalizado

---

## ⚙️ Configuración

### Variables CSS
Edita `frontend/css/styles.css` para cambiar:

```css
:root {
  --color-primary: #3b82f6;        /* Color principal */
  --color-secondary: #6b7280;      /* Color secundario */
  --color-danger: #ef4444;         /* Rojo para peligro */
  --spacing-lg: 1.5rem;            /* Espaciado grande */
  /* ... más variables */
}
```

### Modificar Datos de Prueba
1. Abre `frontend/js/storage.js`
2. Busca `DEFAULT_USUARIOS` o `DEFAULT_TAREAS`
3. Cambia los valores
4. Recarga la página

---

## 🚨 Solución de Problemas

### Problema: La página se carga blanca
**Solución:**
- Limpia el cache (Ctrl+Shift+Delete)
- Recarga la página (F5)
- Usa incógnito (Ctrl+Shift+P)

### Problema: Los datos no se guardan
**Solución:**
- Verifica que localStorage esté habilitado
- Incógnito también soporta localStorage
- Revisa la consola para errores

### Problema: No puedo acceder a "Todas las Tareas"
**Solución:**
- Asegúrate de estar como admin
- Credenciales: `admin / admin123`
- Consulta la consola: `auth.isAdmin()`

### Problema: Las tasas vencidas no se destacan
**Solución:**
- El sistema usa la hora actual del navegador
- Modifica el system time o crea tareas con fecha anterior

### Problema: No funciona en servidor remoto
**Solución:**
- localStorage solo funciona con `http://` o `https://`
- No funciona con `file://` en algunos navegadores
- Usa un servidor local

---

## 📊 Base de Datos SQL

Si deseas conectar a MySQL en lugar de localStorage:

### Importar Schema
```bash
mysql -u root -p tu_base_datos < database/schema.sql
```

### Ver Datos
```sql
-- Todos los usuarios
SELECT * FROM usuarios;

-- Todas las tareas
SELECT * FROM tareas;

-- Tareas por usuario
SELECT u.username, COUNT(t.id) as total_tareas
FROM usuarios u
LEFT JOIN tareas t ON u.id = t.user_id
GROUP BY u.id;
```

### Agregar Usuario
```sql
INSERT INTO usuarios (username, password, role)
VALUES ('nuevo_usuario', 'password123', 'Usuario');
```

### Agregar Tarea
```sql
INSERT INTO tareas (title, due_date, user_id)
VALUES ('Mi nueva tarea', '2026-03-10 17:00:00', 2);
```

---

## 🎥 Grabación de Video

### Setup
1. Usa una resolución clara: 1920x1080 o 1366x768
2. Usa navegador sin extensiones
3. Abre DevTools pero minimizado

### Flujo Recomendado (6 minutos)
1. **Intro** (30 seg): Mostrar pantalla login
2. **Usuario Normal** (2 min):
   - Login como juan_perez
   - Crear tarea
   - Editar tarea
   - Filtrar y buscar
3. **Admin** (2 min):
   - Logout
   - Login como admin
   - Mostrar tabla de todas tareas
   - Mostrar gestión de usuarios
   - Editar tarea de otro usuario
4. **Features** (1 min):
   - Responsividad en móvil
   - localStorage en DevTools
   - Mostrar código
5. **Cierre** (30 seg): Resumen

---

## 🚀 Deployment (GitHub Pages)

Para subir a GitHub Pages:

1. Crea repositorio en GitHub
2. Push del código
3. Ve a Settings > Pages
4. Selecciona rama `main` y carpeta `frontend`
5. Tu app estará en: `https://tuusuario.github.io/repo-name`

---

## 📚 Recursos Útiles

### Documentación
- [README.md](./README.md) - Descripción general
- Código comentado en cada archivo .js

### Herramientas
- Chrome DevTools
- VS Code (Free editor)
- MySQL Workbench (para BD)

### Referencia
- [MDN Web Docs](https://developer.mozilla.org)
- [SQL Tutorial](https://www.w3schools.com/sql/)
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)

---

## ✅ Checklist Antes de Presentar

- ✓ Probaste login con todos los usuarios
- ✓ Creaste/editaste/eliminaste tareas
- ✓ Probaste filtros y búsqueda
- ✓ Verificaste permisos (Admin vs Usuario)
- ✓ Probaste responsividad en móvil
- ✓ Abriste DevTools y mostraste localStorage
- ✓ Revisaste el código (está bien documentado)
- ✓ El código está en GitHub
- ✓ Grabaste video demo (~6 minutos)

---

## 📞 Contacto / Preguntas

Si tienes dudas sobre el proyecto:
1. Revisa la documentación (README.md)
2. Consulta el código comentado
3. Abre DevTools y explora

**Happy Coding! 🚀**
