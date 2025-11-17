# FCT-v1 - Aplicación Buffet con Docker

Esta es una aplicación web para gestionar pedidos en un buffet de sushi, ahora completamente dockerizada.

## 📋 Requisitos previos

- **Docker**: [Descargar e instalar Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose**: Incluido con Docker Desktop

## 🚀 Inicio rápido

### 1. Levantar la aplicación

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
docker-compose up -d
```

Esto iniciará automáticamente:
- **MySQL**: Base de datos (puerto 3306)
- **Node.js Server**: API de la aplicación (puerto 3000)
- **Nginx**: Servidor web estático (puerto 80)

### 2. Verificar que todo está funcionando

```bash
docker-compose ps
```

Deberías ver 3 contenedores en estado "Up".

### 3. Acceder a la aplicación

Abre tu navegador en:
- **Cliente**: `http://localhost`
- **API**: `http://localhost:3000/productos`

## 📝 Variables de entorno

El archivo `.env` contiene las configuraciones principales:

```env
DB_HOST=mysql           # Host de la BD (interno de Docker)
DB_USER=buffet_user     # Usuario de BD
DB_PASSWORD=buffet_password  # Contraseña de BD
DB_NAME=buffet_db       # Nombre de la BD
DB_PORT=3306            # Puerto de BD
PORT=3000               # Puerto del servidor Node.js
WEB_PORT=80             # Puerto del servidor web
```

Puedes modificar estos valores según necesites.

## 🛠️ Comandos útiles

### Ver logs de los servicios

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs del servidor Node.js
docker-compose logs -f server

# Logs de MySQL
docker-compose logs -f mysql

# Logs de Nginx
docker-compose logs -f web
```

### Acceder a la base de datos

```bash
docker exec -it buffet_mysql mysql -u buffet_user -p -D buffet_db
# Contraseña: buffet_password
```

### Acceder a la consola del servidor Node.js

```bash
docker exec -it buffet_server bash
```

### Detener la aplicación

```bash
docker-compose down
```

### Detener y eliminar todo (incluyendo datos)

```bash
docker-compose down -v
```

## 🔄 Reconstruir contenedores después de cambios

Si haces cambios en el código Node.js o en las dependencias:

```bash
docker-compose up -d --build
```

## 📊 Estructura del proyecto

```
FCT-v1/
├── Dockerfile                # Configuración Docker del servidor Node.js
├── docker-compose.yml        # Orquestación de servicios
├── .env                      # Variables de entorno
├── nginx.conf                # Configuración del servidor web
├── init-db.sql              # Script de inicialización de BD
├── index.html               # Página principal del cliente
├── assets/                  # Recursos estáticos
├── cliente/                 # Código del cliente (HTML/CSS/JS)
└── servidor/               # Código del servidor (Node.js/TypeScript)
```

## 🐛 Solución de problemas

### Los contenedores se cierran inmediatamente

Revisa los logs:
```bash
docker-compose logs
```

### Error de conexión a la base de datos

Asegúrate de que MySQL está completamente inicializado:
```bash
docker-compose restart mysql server
```

### Puerto 80 ya está en uso

Cambia el puerto en `.env`:
```env
WEB_PORT=8080
```

Luego accede a `http://localhost:8080`

### Limpiar todo y empezar de nuevo

```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 🔐 Seguridad en producción

Para deployar en producción:

1. Cambia las contraseñas en `.env`
2. Usa secretos de Docker o herramientas como HashiCorp Vault
3. Configura certificados SSL en Nginx
4. Limita los puertos expuestos
5. Usa un registro privado de Docker para las imágenes

## 📧 Contacto y soporte

Para reportar problemas o sugerencias, contacta con el equipo de desarrollo.
