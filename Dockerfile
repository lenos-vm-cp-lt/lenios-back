# Imagen base oficial de Node.js en versión ligera
FROM node:18-alpine

# Definir el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias del servidor
RUN npm install

# Copiar el código fuente del backend
COPY . .

# Exponer el puerto de la API Express
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]