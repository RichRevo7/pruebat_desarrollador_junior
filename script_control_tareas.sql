-- ============================================
-- SCRIPT SQL - SISTEMA CONTROL DE TAREAS
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS control_tareas;
USE control_tareas;

-- ============================================
-- TABLA USUARIOS
-- ============================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'USUARIO') NOT NULL DEFAULT 'USUARIO',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA TAREAS
-- ============================================

CREATE TABLE tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado ENUM('PENDIENTE', 'COMPLETADA', 'ATRASADA') DEFAULT 'PENDIENTE',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATETIME,
    usuario_id INT NOT NULL,

    -- Constraint Foreign Key
    CONSTRAINT fk_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================
-- INSERTAR USUARIOS DE PRUEBA (3)
-- ============================================

INSERT INTO usuarios (username, email, password, rol) VALUES
('admin', 'admin@correo.com', '123456', 'ADMIN'),
('juan_perez', 'juan@correo.com', '123456', 'USUARIO'),
('maria_garcia', 'maria@correo.com', '123456', 'USUARIO');

-- ============================================
-- INSERTAR 5 TAREAS DE PRUEBA
-- ============================================

INSERT INTO tareas (titulo, descripcion, estado, fecha_vencimiento, usuario_id) VALUES
('Configurar base de datos', 'Instalar y configurar MySQL', 'PENDIENTE', '2026-03-06 12:00:00', 1),
('Diseñar interfaz', 'Crear diseño del dashboard', 'COMPLETADA', '2026-03-10 18:00:00', 2),
('Implementar login', 'Desarrollar sistema de autenticación', 'PENDIENTE', '2026-03-08 14:00:00', 3),
('Optimizar consultas', 'Mejorar rendimiento de consultas SQL', 'ATRASADA', '2026-02-28 10:00:00', 2),
('Pruebas del sistema', 'Realizar testing general', 'PENDIENTE', '2026-03-12 16:00:00', 1);