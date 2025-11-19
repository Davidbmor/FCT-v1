# Deploy de la Aplicación

Este proyecto está dividido en dos partes: **cliente** y **servidor**.  
Sigue los pasos a continuación para instalar las dependencias y ejecutar cada uno.

---

## Instalación

### 1. Instalar dependencias del servidor
```bash
cd servidor
npm install

```

### 2. Instalar dependencias del cliente
```bash
cd servidor
npm install
```

### 3. Base de Datos

```bash
Para poder usar la base de datos actual antes hay que tener XAMPP, una vez instalado nos dirigiremos a la carpeta  xampp/mysql/data y pegarem el archivo 
ibdata1 y la carpeta buffet_db e iniciamos el mysql en la aplicacion de XAMPP
```

### 4. Iniciarl la app

Para empezar a usar la aplicacion tendremos que ejecutar los siguientes comandos en su correspondiente directorio: 

/servidor

```bash
npm start
```
/cliente

```bash
npm run dev
```