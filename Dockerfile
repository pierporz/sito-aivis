FROM node:22-alpine

WORKDIR /app

# Installa le dipendenze in un layer separato per sfruttare la cache
COPY package*.json ./
RUN npm install

# Il codice viene montato come volume in dev; questa copia serve al build di produzione
COPY . .

EXPOSE 5173 4173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
