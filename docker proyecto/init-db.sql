-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS buffet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE buffet_db;

-- Deshabilitar foreign key checks para poder truncate
SET FOREIGN_KEY_CHECKS=0;

-- Tabla de alergenos
DROP TABLE IF EXISTS producto_alergeno;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS alergenos;

CREATE TABLE alergenos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  icono VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY nombre (nombre)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de productos
CREATE TABLE productos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  disponible TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_productos_disponible (disponible)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de relación entre productos y alergenos
CREATE TABLE producto_alergeno (
  id INT NOT NULL AUTO_INCREMENT,
  producto_id INT NOT NULL,
  alergeno_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_producto_alergeno (producto_id, alergeno_id),
  KEY idx_producto_alergeno_producto (producto_id),
  KEY idx_producto_alergeno_alergeno (alergeno_id),
  CONSTRAINT producto_alergeno_ibfk_1 FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE CASCADE,
  CONSTRAINT producto_alergeno_ibfk_2 FOREIGN KEY (alergeno_id) REFERENCES alergenos (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insertar alergenos (con códigos numéricosdescriptivos)
INSERT INTO alergenos (nombre, icono) VALUES 
('Gluten', '1'),
('Crustáceos', '2'),
('Huevo', '3'),
('Pescado', '4'),
('Cacahuetes', '5'),
('Frutos secos', '6'),
('Soja', '7'),
('Leche', '8'),
('Moluscos', '9');

-- Insertar productos
INSERT INTO productos (nombre, descripcion, precio, disponible) VALUES 
('Nigiri Salmon', 'Arroz cubierto con salmón fresco - 3 piezas', 5.50, 1),
('Nigiri Atún', 'Arroz cubierto con atún rojo - 3 piezas', 6.00, 1),
('Nigiri Aguacate', 'Arroz cubierto con aguacate - 3 piezas', 4.50, 1),
('Maki Philadelphia', 'Rollo de salmón, queso crema y pepino - 6 piezas', 7.00, 1),
('Maki California', 'Rollo de cangrejo, aguacate y pepino - 6 piezas', 6.50, 1),
('Tempura Camarones', 'Camarones fritos con salsa agridulce', 8.00, 1),
('Edamame', 'Habas de soja salteadas', 3.50, 1),
('Gyoza', 'Dumplings rellenos de cerdo y verduras - 6 piezas', 5.50, 1),
('Tabla de sushi variada', 'Surtido de nigiri y maki - 18 piezas', 22.00, 1),
('Bebida - Té helado', 'Té frío natural', 2.50, 1);

-- Asociar alergenos a productos
INSERT INTO producto_alergeno (producto_id, alergeno_id) VALUES 
(1, 4),  -- Nigiri Salmon: Pescado
(2, 4),  -- Nigiri Atún: Pescado
(4, 4),  -- Maki Philadelphia: Pescado
(4, 7),  -- Maki Philadelphia: Soja
(4, 8),  -- Maki Philadelphia: Leche
(5, 4),  -- Maki California: Pescado
(5, 7),  -- Maki California: Soja
(6, 7),  -- Tempura Camarones: Soja
(6, 9),  -- Tempura Camarones: Moluscos
(8, 7),  -- Gyoza: Soja
(9, 4),  -- Tabla de sushi: Pescado
(9, 7),  -- Tabla de sushi: Soja
(9, 8);  -- Tabla de sushi: Leche

-- Reactivar foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Crear usuario y grant permisos si no existen
CREATE USER IF NOT EXISTS 'buffet_user'@'%' IDENTIFIED WITH mysql_native_password BY 'buffet_password';
CREATE USER IF NOT EXISTS 'buffet_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'buffet_password';
GRANT ALL PRIVILEGES ON buffet_db.* TO 'buffet_user'@'%';
GRANT ALL PRIVILEGES ON buffet_db.* TO 'buffet_user'@'localhost';
FLUSH PRIVILEGES;
