# frontend/Dockerfile
FROM node:20-alpine as build

WORKDIR /frontend

COPY package.json package-lock.json ./
RUN npm install --production

COPY . .

RUN . ./.env/dev.env && npm run build


FROM nginx:alpine


COPY --from=build /frontend/build /usr/share/nginx/html

COPY ./nginx/prod.nginx.conf /etc/nginx/conf.d/default.conf


# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]