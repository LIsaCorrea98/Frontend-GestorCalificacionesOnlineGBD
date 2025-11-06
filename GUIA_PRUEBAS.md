# Guía de Pruebas - Frontend con Backend

## 🚀 Pasos para Correr la Aplicación

### 1. Verificar que el Backend está Corriendo

Tu backend debe estar corriendo en `http://localhost:8080`.

**Para verificar:**
- Abre tu navegador y ve a: `http://localhost:8080`
- O prueba con: `curl http://localhost:8080/api/auth/login`

Si no responde, inicia tu backend primero.

### 2. Iniciar el Frontend

Abre una terminal en la carpeta `frontend` y ejecuta:

```bash
cd frontend
npm install  # Solo la primera vez
npm run dev
```

Deberías ver algo como:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Abrir en el Navegador

Abre: `http://localhost:5173` (o el puerto que te indique Vite)

---

## 📝 Escenario de Prueba Completo

### Paso 1: Registrar un Docente

1. Ve a `http://localhost:5173`
2. Haz clic en "Regístrate aquí" o ve a `/register`
3. Completa el formulario:
   - **Nombres**: Profesor García
   - **Apellidos**: García
   - **Email**: profesor@universidad.com
   - **Contraseña**: password123
   - **Rol**: Docente
   - **Código**: PROF001
4. Haz clic en "Registrarse"
5. Deberías ver un mensaje de éxito
6. Haz clic en "Volver al Login"

### Paso 2: Registrar un Estudiante

1. En la página de login, haz clic en "Regístrate aquí"
2. Completa el formulario:
   - **Nombres**: Ana
   - **Apellidos**: Estudiante
   - **Email**: ana@estudiante.com
   - **Contraseña**: password123
   - **Rol**: Estudiante
   - **Código**: EST001
3. Haz clic en "Registrarse"
4. Verás el mensaje de éxito
5. Haz clic en "Volver al Login"

### Paso 3: Login como Docente

1. Ingresa:
   - **Email**: profesor@universidad.com
   - **Contraseña**: password123
2. Haz clic en "Iniciar sesión"
3. Deberías ser redirigido al dashboard del profesor (`/teacher`)

**Lo que verás:**
- Panel lateral con opciones de docente
- Dashboard con KPIs
- Lista de cursos (inicialmente vacía)

### Paso 4: Subir un Archivo CSV

1. En el menú lateral, haz clic en "📤 Subir Calificaciones (CSV)"
2. Primero completa los datos del curso:
   - **Código del curso**: PROG101
   - **Nombre del curso**: Programación I
   - **Descripción**: Curso introductorio de programación
3. Haz clic en "Seleccionar archivo" y elige un archivo CSV

**Formato del CSV:**
Crea un archivo `calificaciones.csv` con este contenido:
```csv
Student Name,Ejercicio 1,Ejercicio 2,Ejercicio 3
Ana Estudiante,100,80,Not Submitted
Juan Pérez,90,Not Submitted,100
María García,85,95,90
```

4. Verás una vista previa del CSV
5. Haz clic en "Subir CSV"
6. Espera el mensaje de éxito "✓ Archivo cargado exitosamente"

### Paso 5: Ver Cursos como Docente

1. Ve a "📚 Mis Cursos" en el menú lateral
2. Verás el curso "Programación I" con:
   - Número de estudiantes
   - Número de ejercicios

### Paso 6: Login como Estudiante

1. Haz clic en "Cerrar Sesión" en el panel lateral
2. Serás redirigido al login
3. Ingresa con las credenciales del estudiante:
   - **Email**: ana@estudiante.com
   - **Contraseña**: password123
4. Haz clic en "Iniciar sesión"
5. Serás redirigido al dashboard del estudiante (`/student`)

### Paso 7: Ver Cursos como Estudiante

1. En el menú lateral, haz clic en "Mis Cursos"
2. Verás el curso "Programación I" con:
   - Nombre del curso
   - Porcentaje de progreso
   - Botón "Ver calificaciones"

### Paso 8: Ver Calificaciones

1. Haz clic en el botón "Ver calificaciones" del curso
2. Verás:
   - Nombre del curso y promedio
   - Lista de ejercicios con:
     - Nombre del ejercicio
     - Estado (✅ Correcto, ❌ Incorrecto, ⚠️ Pendiente, ➖ No entregado)
     - Nota (si aplica)

---

## 🔍 Verificar en la Consola del Navegador

Abre las **DevTools** (F12) y ve a la pestaña **Console**. Deberías ver:

```
✅ Login exitoso:
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "...",
    name: "Profesor García",
    email: "profesor@universidad.com",
    role: "TEACHER"
  }
}

✅ Upload successful:
{
  message: "Archivo CSV procesado exitosamente",
  courseId: "...",
  courseName: "Programación I",
  totalStudents: 3,
  totalExercises: 3,
  success: true
}
```

---

## 🐛 Solución de Problemas

### Error: "Network Error" o "Failed to fetch"

**Causa**: El backend no está corriendo o no está en el puerto correcto.

**Solución**:
```bash
# Verifica que el backend esté corriendo
# Debería estar en: http://localhost:8080

# Si usas Postman, prueba:
# GET http://localhost:8080/api/auth/login
```

### Error: "401 Unauthorized"

**Causa**: El token JWT ha expirado o es inválido.

**Solución**:
1. Cierra sesión
2. Vuelve a iniciar sesión
3. El token se renovará

### Error: "404 Not Found" en las llamadas API

**Causa**: La URL del backend no es correcta.

**Solución**:
Edita `frontend/src/services/api.js` y verifica:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

Si tu backend usa otro puerto, cámbialo aquí.

### Los datos no se actualizan después de subir CSV

**Solución**:
- Refresca la página (F5)
- O espera unos segundos y actualiza manualmente

---

## 📊 Datos de Prueba Recomendados

### Para Docente:
```
Email: profesor@universidad.com
Password: password123
Código: PROF001
```

### Para Estudiante:
```
Email: ana@estudiante.com
Password: password123
Código: EST001
```

### CSV de Ejemplo:
```csv
Student Name,Ejercicio 1,Ejercicio 2,Ejercicio 3,Ejercicio 4
Ana Estudiante,100,85,90,Not Submitted
Juan Pérez,95,90,85,100
María García,80,95,100,90
Pedro López,100,100,95,100
Sofía Martínez,90,85,80,Not Submitted
```

---

## ✅ Checklist de Funcionalidades

Marca estas funcionalidades cuando las pruebes:

- [ ] Registro de docente exitoso
- [ ] Registro de estudiante exitoso
- [ ] Login como docente
- [ ] Login como estudiante
- [ ] Upload de CSV
- [ ] Visualizar cursos (docente)
- [ ] Visualizar cursos (estudiante)
- [ ] Ver calificaciones por curso (estudiante)
- [ ] Logout funcional
- [ ] Rutas protegidas (sin login no puedes acceder)
- [ ] Redirección automática según rol

---

## 🎯 Próximos Pasos

Una vez que todo funcione:
1. Verifica que los datos se persistan en tu base de datos
2. Prueba con más estudiantes y ejercicios
3. Verifica las estadísticas en el dashboard del docente
4. Prueba diferentes navegadores (Chrome, Firefox, Edge)

---

**Nota**: Si encuentras algún error, revisa:
1. La consola del navegador (F12 → Console)
2. La consola del backend
3. La pestaña Network en DevTools para ver las peticiones HTTP

