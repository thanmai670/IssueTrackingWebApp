FROM denoland/deno:1.22.1 AS build
WORKDIR /root/the-secret-ingredient-backend
COPY . .
RUN deno compile --allow-all -o artefact ./src/main.ts

FROM denoland/deno:1.22.1 as the-secret-ingredient-backend
WORKDIR /root/the-secret-ingredient-backend
COPY --from=build /root/the-secret-ingredient-backend/artefact ./
CMD ./artefact