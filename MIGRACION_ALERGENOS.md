# Migración de Alérgenos: SVG a Imágenes PNG

## Cambios realizados:

### 1. Base de datos
- **Script SQL creado**: `db/update_alergenos_rutas.sql`
- **Cambio**: Campo `svg` renombrado a `ruta_imagen`
- **Actualización**: Todas las rutas apuntan a archivos PNG en `/alergenos/`

### 2. Backend (Servidor)

#### Modelo (src/models/Alergeno.ts)
- Interfaz `Alergeno`: Campo `svg` cambiado a `ruta_imagen`
- Query actualizada para seleccionar `ruta_imagen` en lugar de `svg`

#### Servidor principal (index.ts)
- Agregada ruta estática: `app.use('/alergenos', express.static('alergenos'));`
- Ahora el servidor sirve imágenes desde la carpeta `servidor/alergenos/`

#### Carpeta creada
- `servidor/alergenos/` - Para almacenar las imágenes PNG de alérgenos
- Incluye README.md con instrucciones

### 3. Frontend (Cliente)

#### Archivos actualizados:
- `src/pages/info.astro`: Usa `<img>` en lugar de `set:html` para SVG
- `src/pages/info/[id].astro`: Usa `<img>` en lugar de `set:html` para SVG

#### Cambio de renderizado:
**Antes:**
```astro
<span set:html={alergeno.svg} />
```

**Después:**
```astro
<img 
    src={`http://localhost:3000${alergeno.ruta_imagen}`} 
    alt={alergeno.nombre}
/>
```

## Pasos para completar la migración:

1. **Ejecutar el script SQL**:
   ```bash
   mysql -u root -p buffet_db < db/update_alergenos_rutas.sql
   ```

2. **Añadir las imágenes PNG**:
   - Coloca las 14 imágenes de alérgenos en `servidor/alergenos/`
   - Nombres requeridos: ver `servidor/alergenos/README.md`

3. **Reiniciar el servidor**:
   ```bash
   cd servidor
   npm start
   ```

4. **Reiniciar el cliente**:
   ```bash
   cd cliente
   npm run dev
   ```

## Ventajas de este cambio:

✅ Mayor flexibilidad para actualizar iconos de alérgenos
✅ Mejor rendimiento (no parsear SVG como HTML)
✅ Estructura consistente con las imágenes de productos
✅ Más fácil de mantener y actualizar
✅ Posibilidad de usar diferentes formatos de imagen (PNG, SVG, WEBP)
