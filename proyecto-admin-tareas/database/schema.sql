/*
  ================================================================
  ESQUEMA DE BASE DE DATOS - SISTEMA DE GESTIÓN DE TAREAS
  ================================================================
  
  Descripción:
    Esquema SQL que define la estructura de la base de datos
    para el sistema de gestión de tareas con soporte para
    múltiples usuarios y roles.
  
  Entidades:
    1. USUARIOS
       - Almacena información de autenticación
       - Define roles (Administrador, Usuario)
       - Registra fecha de creación
    
    2. TAREAS
       - Almacena tareas del sistema
       - Vinculadas a un usuario (propietario)
       - Estados: Pendiente, Completada
       - Fechas de creación y vencimiento
  
  Relaciones:
    - Tareas tiene FK a Usuarios (user_id)
    - Eliminación en cascada: al borrar usuario, se borran sus tareas
  
  Índices:
    - username: búsqueda rápida de usuarios
    - user_id: filtrado de tareas por usuario
    - status: filtrado de tareas por estado
    - due_date: ordenamiento de tareas por vencimiento
  
  Usuarios de Prueba:
    - admin / admin123 (Administrador)
    - juan_perez / password123 (Usuario)
    - maria_garcia / password456 (Usuario)
  ================================================================
*/

DROP TABLE IF EXISTS tareas;
DROP TABLE IF EXISTS usuarios;


CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del usuario',
  username VARCHAR(50) UNIQUE NOT NULL COMMENT 'Nombre de usuario único',
  password VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada',
  role ENUM('Administrador', 'Usuario') NOT NULL DEFAULT 'Usuario' COMMENT 'Rol del usuario',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  INDEX idx_username (username) COMMENT 'Índice para búsquedas rápidas por usuario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de usuarios del sistema';


CREATE TABLE tareas (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de la tarea',
  title VARCHAR(255) NOT NULL COMMENT 'Título de la tarea',
  status ENUM('Pendiente', 'Completada') NOT NULL DEFAULT 'Pendiente' COMMENT 'Estado de la tarea',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  due_date DATETIME NOT NULL COMMENT 'Fecha de vencimiento',
  user_id INT NOT NULL COMMENT 'Usuario propietario de la tarea',
  

  CONSTRAINT chk_dates 
    CHECK (due_date >= DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s')),
  

  CONSTRAINT fk_tareas_usuario 
    FOREIGN KEY (user_id) 
    REFERENCES usuarios(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  

  INDEX idx_user_id (user_id) COMMENT 'Índice para filtrar tareas por usuario',
  INDEX idx_status (status) COMMENT 'Índice para filtrar tareas por estado',
  INDEX idx_due_date (due_date) COMMENT 'Índice para ordenar por fecha'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de tareas del sistema';


INSERT INTO usuarios (username, password, role) VALUES
('admin', 'admin123', 'Administrador'),
('juan_perez', 'password123', 'Usuario'),
('maria_garcia', 'password456', 'Usuario');


INSERT INTO tareas (title, status, created_at, due_date, user_id) VALUES

('Desarrollar módulo de autenticación', 'Pendiente', '2026-03-01 09:00:00', '2026-03-05 17:00:00', 2),
('Revisar código del servidor', 'Completada', '2026-02-25 10:00:00', '2026-03-02 18:00:00', 2),


('Diseñar UI de dashboard', 'Pendiente', '2026-02-28 14:00:00', '2026-03-07 17:00:00', 3),
('Testing de formularios', 'Pendiente', '2026-03-01 11:00:00', '2026-03-04 15:00:00', 3),


('Configurar base de datos', 'Pendiente', '2026-02-20 08:00:00', '2026-03-06 12:00:00', 1);


SELECT 
  t.id,
  t.title AS 'Título',
  t.status AS 'Estado',
  t.created_at AS 'Creada el',
  t.due_date AS 'Vencimiento',
  DATEDIFF(t.due_date, NOW()) AS 'Días para vencer',
  u.username AS 'Usuario',
  u.role AS 'Rol'
FROM tareas t
INNER JOIN usuarios u ON t.user_id = u.id
ORDER BY t.due_date ASC;


SELECT 
  u.username AS 'Usuario',
  u.role AS 'Rol',
  SUM(CASE WHEN t.status = 'Pendiente' THEN 1 ELSE 0 END) AS 'Tareas Pendientes',
  SUM(CASE WHEN t.status = 'Completada' THEN 1 ELSE 0 END) AS 'Tareas Completadas',
  COUNT(t.id) AS 'Total Tareas'
FROM usuarios u
LEFT JOIN tareas t ON u.id = t.user_id
GROUP BY u.id, u.username, u.role
ORDER BY u.username;


SELECT 
  t.id,
  t.title AS 'Título',
  t.created_at AS 'Creada el',
  t.due_date AS 'Debería estar lista el',
  DATEDIFF(NOW(), t.due_date) AS 'Días atrasada',
  u.username AS 'Usuario'
FROM tareas t
INNER JOIN usuarios u ON t.user_id = u.id
WHERE t.status = 'Pendiente' 
  AND t.due_date < NOW()
ORDER BY t.due_date ASC;


DELIMITER $$

CREATE PROCEDURE sp_get_dashboard_user(IN p_username VARCHAR(50))
BEGIN
  SELECT 
    u.id,
    u.username,
    u.role,
    COUNT(CASE WHEN t.status = 'Pendiente' THEN 1 END) AS tareas_pendientes,
    COUNT(CASE WHEN t.status = 'Completada' THEN 1 END) AS tareas_completadas,
    COUNT(t.id) AS total_tareas,
    SUM(CASE WHEN t.status = 'Pendiente' AND t.due_date < NOW() THEN 1 ELSE 0 END) AS tareas_atrasadas
  FROM usuarios u
  LEFT JOIN tareas t ON u.id = t.user_id
  WHERE u.username = p_username
  GROUP BY u.id, u.username, u.role;
END$$

DELIMITER ;
