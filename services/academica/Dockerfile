# Etapa de build (TypeScript → dist)
FROM node:20-alpine AS build

RUN apk add --no-cache bash

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Compilar TS
RUN npm run build

# ---------------- Imagen final (runtime) ----------------
FROM node:20-alpine AS runtime

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

# ✅ Copiamos el código compilado
COPY --from=build /usr/src/app/dist ./dist

# ✅ Copiamos también las plantillas DOCX
COPY --from=build /usr/src/app/templates ./templates

ENV NODE_ENV=production

EXPOSE 3000

# Ajusta a tu entrypoint real
CMD ["node", "dist/index.js"]
# o, si tu build genera otra ruta:
# CMD ["node", "dist/src/index.js"]
