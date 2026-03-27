# Etapa 1: build Angular
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG BUILD_CONFIG=production

# Build producción (usa la config por defecto -> production)
RUN npm run build -- --configuration=$BUILD_CONFIG

# Etapa 2: servir con Nginx
FROM nginx:alpine

# Zona horaria opcional
ENV TZ=America/Bogota
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && apk del tzdata

# Quitamos la config por defecto de Nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiamos nuestra config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 👇 AQUÍ la ruta correcta del build:
# dist/udea-academica/browser
COPY --from=build /app/dist/udea-academica/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
