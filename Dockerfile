FROM node:24.11.1

ARG PORT=3000

ENV PORT=${PORT}

WORKDIR /bot

COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]

EXPOSE 3000
