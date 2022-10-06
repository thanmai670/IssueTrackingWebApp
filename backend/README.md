# Documentation

## Running the application

### As a dev

```console
deno run --allow-all ./src/main.ts
```

### For docker

```console
docker-compose up
```

#### Forcing a rebuild

```console
docker-compose up --build
```

## Conventions

### Dependencies

Dependencies are to be exported in the [deps.ts](./src/deps.ts) file.

### Testing

Information on running tests straight from [Deno](https://deno.land) are available [here](https://deno.land/manual/testing).
