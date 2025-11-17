# Usar imagen base de Node.js
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json si existe
COPY servidor/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código del servidor
COPY servidor/ .

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando para iniciar el servidor compilado
CMD ["node", "dist/index.js"]
