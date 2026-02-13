# Media local para pruebas

Este directorio se publica en la ruta:

- `http://TU_IP_LOCAL:3000/media/...`

## Estructura recomendada

```text
backend/public/media/chefs/<chef-id>/avatar.jpg
backend/public/media/chefs/<chef-id>/cover.jpg
backend/public/media/chefs/<chef-id>/gallery-1.jpg
backend/public/media/chefs/<chef-id>/gallery-2.jpg
backend/public/media/chefs/<chef-id>/gallery-3.jpg
```

Extensiones soportadas: `jpg`, `jpeg`, `png`, `webp`.

## Chef IDs actuales

- `erick-martinez`
- `carlos-bbq`
- `martin-asador`
- `luis-bbq`
- `cories-bbq`

Con solo colocar los archivos con esos nombres, el backend los usa automaticamente en la API (`GET /chefs`) sin cambiar codigo adicional.
