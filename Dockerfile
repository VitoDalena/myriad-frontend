# Fase 1: Build dell'app Angular
FROM node:20 AS build

# Imposta la directory di lavoro
WORKDIR /app

# Copia il package.json e installa le dipendenze
COPY package*.json ./
RUN npm install

# Copia il resto dell'app
COPY . .

# Esegui la build Angular
RUN npm run build -- --configuration production

# Fase 2: Immagine finale Nginx
FROM nginx:alpine

# Copia i file costruiti dalla fase precedente
COPY --from=build /app/dist/vaitoverse-portal /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Esponi la porta 80
EXPOSE 80

# Avvia Nginx
CMD ["nginx", "-g", "daemon off;"]
