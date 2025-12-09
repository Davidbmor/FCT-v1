-- Script para actualizar la tabla de alergenos

USE buffet_db;

-- Modificar la columna svg a ruta_imagen
ALTER TABLE alergenos 
CHANGE COLUMN svg ruta_imagen TEXT;

-- Actualizar las rutas de las imágenes de los alérgenos
UPDATE alergenos SET ruta_imagen = '/alergenos/gluten.png' WHERE nombre = 'Gluten';
UPDATE alergenos SET ruta_imagen = '/alergenos/crustaceos.png' WHERE nombre = 'Crustáceos';
UPDATE alergenos SET ruta_imagen = '/alergenos/huevos.png' WHERE nombre = 'Huevos';
UPDATE alergenos SET ruta_imagen = '/alergenos/pescado.png' WHERE nombre = 'Pescado';
UPDATE alergenos SET ruta_imagen = '/alergenos/cacahuetes.png' WHERE nombre = 'Cacahuetes';
UPDATE alergenos SET ruta_imagen = '/alergenos/soja.png' WHERE nombre = 'Soja';
UPDATE alergenos SET ruta_imagen = '/alergenos/lacteos.png' WHERE nombre = 'Lácteos';
UPDATE alergenos SET ruta_imagen = '/alergenos/frutos_secos.png' WHERE nombre = 'Frutos de cáscara';
UPDATE alergenos SET ruta_imagen = '/alergenos/apio.png' WHERE nombre = 'Apio';
UPDATE alergenos SET ruta_imagen = '/alergenos/mostaza.png' WHERE nombre = 'Mostaza';
UPDATE alergenos SET ruta_imagen = '/alergenos/sesamo.png' WHERE nombre = 'Sésamo';
UPDATE alergenos SET ruta_imagen = '/alergenos/sulfitos.png' WHERE nombre = 'Sulfitos';
UPDATE alergenos SET ruta_imagen = '/alergenos/altramuces.png' WHERE nombre = 'Altramuces';
UPDATE alergenos SET ruta_imagen = '/alergenos/moluscos.png' WHERE nombre = 'Moluscos';

SELECT * FROM alergenos;
