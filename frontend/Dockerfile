# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /frontend

COPY package.json package-lock.json ./
RUN npm install --production

COPY . .

CMD ["npm", "start"]
