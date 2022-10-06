FROM node:lts-alpine AS build
WORKDIR /root/the-secret-ingredient-frontend
COPY . .
RUN yarn
RUN yarn build

FROM node:lts-alpine AS the-secret-ingredient-frontend
WORKDIR /root/the-secret-ingredient-frontend
COPY --from=build /root/the-secret-ingredient-frontend/build ./build
RUN yarn global add serve
EXPOSE 3000
CMD ["serve", "-s", "build"]

# FROM nginx:stable-alpine AS the-secret-ingredient-frontend
# WORKDIR /etc/nginx/conf.d
# RUN rm ./default.conf
# COPY ./default-nginx.conf ./
# WORKDIR /usr/share/nginx/html
# COPY --from=build /root/the-secret-ingredient-frontend/build ./
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]