# Configuración de la API

## URL de la API

El frontend está configurado para conectarse automáticamente a la API en producción:
- **Producción**: `https://gestor-calificaciones.onrender.com/api`

## Configuración para Desarrollo Local

Si deseas usar el backend local durante el desarrollo:

1. Crea un archivo `.env.local` en la carpeta `frontend/`:
```env
VITE_API_URL=http://localhost:8080/api
```

2. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

## Variables de Entorno

El proyecto usa Vite, que requiere que las variables de entorno comiencen con `VITE_`.

- `VITE_API_URL`: URL base de la API (opcional, por defecto usa la URL de producción)

## Verificación

Para verificar qué URL está usando el frontend, abre la consola del navegador (F12) y busca el mensaje:
```
API Base URL: https://gestor-calificaciones.onrender.com/api
```

