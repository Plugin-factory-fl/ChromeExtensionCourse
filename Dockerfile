FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY index.js server ./server/
ENV NODE_ENV=production
CMD ["node", "index.js"]
