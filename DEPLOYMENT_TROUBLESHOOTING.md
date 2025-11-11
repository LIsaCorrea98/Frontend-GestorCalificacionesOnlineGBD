# Guía de Solución de Problemas en Despliegue

## 🔍 Problema: Error 404 al intentar registrar

### Posibles causas y soluciones:

### 1. ✅ Archivo `_redirects` configurado
El archivo `_redirects` ya está creado en `public/_redirects` con el contenido:
```
/*    /index.html   200
```

**Verificación:** Este archivo se copia automáticamente a `dist/` durante el build. Si no funciona, verifica que esté en el build final.

### 2. 🔧 Variables de Entorno en Render

**IMPORTANTE:** Aunque el `render.yaml` tiene la variable configurada, debes verificar que esté configurada en el dashboard de Render:

1. Ve a tu servicio en Render: https://dashboard.render.com
2. Selecciona tu servicio de frontend (static site)
3. Ve a la sección **"Environment"** o **"Environment Variables"**
4. Verifica que exista:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://gestor-calificaciones.onrender.com/api`

**Si no existe, agrégalo manualmente:**
- Click en "Add Environment Variable"
- Key: `VITE_API_URL`
- Value: `https://gestor-calificaciones.onrender.com/api`
- Guarda los cambios

### 3. 🔄 Despliegue Automático en Render

**Sí, Render se buildea automáticamente cuando haces push a GitHub**, PERO:

- Solo si tienes el repositorio conectado a Render
- El build puede tardar varios minutos
- Después de agregar/modificar variables de entorno, Render hace un nuevo build automáticamente

**Para forzar un nuevo build:**
1. Ve al dashboard de Render
2. Click en "Manual Deploy" → "Deploy latest commit"

### 4. 🐛 Debugging en Producción

Abre la consola del navegador (F12) y verifica:

1. **URL de la API configurada:**
   ```
   🔧 API Base URL configurada: https://gestor-calificaciones.onrender.com/api
   ```

2. **Si ves "NO CONFIGURADA":**
   - La variable de entorno no está configurada en Render
   - Agrega `VITE_API_URL` en el dashboard de Render

3. **Al intentar registrar, verás:**
   ```
   📤 Registrando usuario en: https://gestor-calificaciones.onrender.com/api/auth/register
   📥 Respuesta del servidor: 200 OK (o el código de error)
   ```

### 5. ✅ Verificar que el Backend esté funcionando

Abre en tu navegador o usa curl:
```bash
curl https://gestor-calificaciones.onrender.com/api/auth/register -X POST -H "Content-Type: application/json" -d '{"test":"test"}'
```

Si el backend no responde, el problema está en el backend, no en el frontend.

### 6. 🔐 Problemas de CORS

Si ves errores de CORS en la consola, el backend necesita permitir el origen de tu frontend. Verifica la configuración de CORS en el backend.

## 📋 Checklist de Verificación

- [ ] Archivo `_redirects` existe en `public/`
- [ ] Variable `VITE_API_URL` configurada en Render dashboard
- [ ] Backend está corriendo y accesible
- [ ] Build reciente en Render (verifica los logs)
- [ ] Consola del navegador muestra la URL correcta de la API
- [ ] No hay errores de CORS en la consola

## 🚀 Pasos para Solucionar

1. **Verifica variables de entorno en Render:**
   - Dashboard → Tu servicio → Environment → Verifica `VITE_API_URL`

2. **Fuerza un nuevo build:**
   - Dashboard → Manual Deploy → Deploy latest commit

3. **Espera a que termine el build** (puede tardar 3-5 minutos)

4. **Abre la consola del navegador** y verifica los logs

5. **Intenta registrar nuevamente** y revisa los mensajes en consola

## 📞 Si el problema persiste

Comparte:
- Los mensajes de la consola del navegador
- Los logs del build en Render
- El estado del backend (¿está corriendo?)

