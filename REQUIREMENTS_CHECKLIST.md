# Checklist de Requerimientos - Calificaciones OnlineGBD

## ✅ Historias de Usuario - DOCENTE

### HU1. "Como docente, quiero auto-registrarme"
- ✅ Pantalla `/register` implementada
- ✅ Formulario con: nombres, apellidos, correo, contraseña, rol, código
- ✅ Si rol es "docente", backend lo registra como TEACHER
- ✅ Validación de campos obligatorios con mensajes de error
- ✅ Escenarios de prueba:
  - ✅ Registro válido (docente) → redirige a /login
  - ✅ Registro con correo inválido → muestra error
  - ✅ Registro sin rol → muestra error

### HU2. "Como docente, quiero crear y administrar cursos (CRUD)"
- ✅ Botón "+ Crear curso" en `/teacher` y `/teacher/courses`
- ✅ Formulario con nombre y código del curso
- ✅ POST `/api/teacher/courses` implementado en backend
- ✅ Validación de código repetido (409 Conflict)
- ✅ Escenarios de prueba:
  - ✅ Crear curso válido → aparece en tabla
  - ✅ Crear curso sin código → muestra error
  - ✅ Crear curso con código repetido → muestra error 409
  - ✅ Listar cursos del docente → solo ve sus cursos

**Nota:** Editar y eliminar cursos están pendientes en el backend (se muestran mensajes informativos).

### HU3. "Como docente, quiero subir calificaciones en formato CSV"
- ✅ Pantalla `/teacher/upload` implementada
- ✅ Input tipo file que acepta .csv
- ✅ Vista previa de primeras 20 filas al seleccionar archivo
- ✅ POST `/api/teacher/upload-csv` conectado
- ✅ Validación de columnas requeridas ("Student Name")
- ✅ Mensajes de error claros
- ✅ Escenarios de prueba:
  - ✅ Subir CSV válido → muestra "calificaciones cargadas"
  - ✅ Subir CSV con columnas faltantes → muestra error
  - ✅ Redirección automática al curso después de subir

### HU4. "Como docente, quiero ver las calificaciones de mis estudiantes en tablas claras"
- ✅ Tabla en `/teacher/courses?courseId=...` con:
  - ✅ Estudiante
  - ✅ Email
  - ✅ Correctos
  - ✅ Incorrectos
  - ✅ Pendientes
  - ✅ No entregados
  - ✅ Promedio
  - ✅ % Completado
- ✅ Filtro/búsqueda por nombre o email con comodines (* y ?)
- ✅ Escenarios de prueba:
  - ✅ Ver calificaciones después de subir CSV → muestra estudiantes
  - ✅ Buscar por nombre → filtra resultados

### HU5. "Como docente, quiero acceder a estadísticas de cada curso"
- ✅ Pantalla `/teacher/stats?courseId=...`
- ✅ Muestra:
  - ✅ Promedio del curso
  - ✅ % de aprobación
  - ✅ Total de entregas
  - ✅ Distribución (correctos, incorrectos, pendientes, no entregados)
- ✅ KPIs con tarjetas visuales
- ✅ Escenarios de prueba:
  - ✅ Curso con datos → muestra todas las estadísticas
  - ✅ Curso sin datos → mensaje informativo

### HU6. "Como docente, quiero consultar el podio de estudiantes"
- ✅ Bloque "Top 3 estudiantes" en `/teacher/stats`
- ✅ Ordenado por cantidad de ejercicios resueltos
- ✅ Muestra nombre y valor
- ✅ Escenarios de prueba:
  - ✅ Más de 3 estudiantes → muestra solo los 3 mejores

### HU7. "Como docente, quiero consultar el podio de ejercicios"
- ✅ "Ejercicios más acertados" y "Ejercicios más fallados"
- ✅ Cada línea con nombre del ejercicio y conteo
- ✅ Gráficos de barras visuales
- ✅ Escenarios de prueba:
  - ✅ Después de subir CSV → ejercicios aparecen con su conteo

### HU8. "Como docente, quiero filtrar estudiantes y calificaciones con comodines"
- ✅ Input de búsqueda en `/teacher/courses`
- ✅ Soporta `*` (cualquier secuencia) y `?` (un carácter)
- ✅ Escenarios de prueba:
  - ✅ Buscar "115" → muestra estudiantes con código que empieza por 115
  - ✅ Buscar "ana" → muestra estudiantes con nombre que contenga "ana"
  - ✅ Buscar "*García" → muestra todos los García

### HU9. "Como docente, quiero acceder a la bitácora de entregas"
- ✅ Pantalla `/teacher/logs` implementada
- ✅ Filtros: curso, estudiante
- ✅ Tabla: estudiante, email, correctos, incorrectos, pendientes, no entregados, promedio, % completado
- ✅ Tabla adicional: bitácora por ejercicio
- ✅ Escenarios de prueba:
  - ✅ Ver bitácora de un curso → muestra tabla completa
  - ✅ Filtrar por estudiante → filtra resultados

## ✅ Historias de Usuario - ESTUDIANTE

### HU10. "Como estudiante, quiero auto-registrarme"
- ✅ Igual que docente, pero con rol estudiante
- ✅ Validaciones implementadas

### HU11. "Como estudiante, quiero vincularme a mis cursos"
- ✅ Los estudiantes se vinculan automáticamente al procesar CSV
- ✅ `/student/courses` muestra los cursos del backend
- ✅ El backend ya sabe a qué cursos pertenece el estudiante (viene del CSV)

### HU12. "Como estudiante, quiero ver mis ejercicios con estado"
- ✅ Página `/student/grades/:courseId`
- ✅ Lista con: ejercicio, estado, nota
- ✅ Estado con iconos/colores ✅ ❌ ⚠️ ➖
- ✅ Escenarios de prueba:
  - ✅ Curso con datos → muestra todos los ejercicios
  - ✅ Filtro por estado → al seleccionar "correctos", solo se ven los correctos

### HU13. "Como estudiante, quiero ver mi calificación por ejercicio"
- ✅ Página `/student/exercise/:exerciseId`
- ✅ Muestra: nombre del ejercicio, nota, estado, fecha de entrega
- ✅ Escenarios de prueba:
  - ✅ Desde lista de ejercicios, al hacer clic → lleva al detalle

### HU14. "Como estudiante, quiero ver resumen visual"
- ✅ Dashboard `/student` con:
  - ✅ Total de ejercicios
  - ✅ Correctos
  - ✅ Incorrectos
  - ✅ Pendientes
  - ✅ Promedio
- ✅ Gráfico de progreso visual (barras)
- ✅ Distribución de estados

## ✅ Flujo Especial: CSV

### Proceso de carga CSV
1. ✅ Docente entra a `/teacher/upload`
2. ✅ Selecciona CSV de carpeta data
3. ✅ Frontend lee CSV y muestra preview
4. ✅ Backend recibe CSV y:
   - ✅ Si curso no existe → lo crea
   - ✅ Si estudiante no existe → lo crea / lo asocia al curso
   - ✅ Crea/actualiza la calificación
5. ✅ Docente va a `/teacher/courses?courseId=...` → ve reflejado lo del CSV
6. ✅ Estudiante que está en ese CSV, cuando entra a `/student/grades/:courseId`, ve sus resultados

### Pruebas con CSV
- ✅ CSV con 1 estudiante y 1 ejercicio
- ✅ CSV con 2 estudiantes y mismo ejercicio
- ✅ CSV con ejercicio con estado "pendiente" → aparece amarillo ⚠️
- ✅ CSV con estudiante que no estaba antes → aparece en la tabla

## 🔧 Mejoras Técnicas Implementadas

### Frontend
- ✅ Diseño moderno y responsive
- ✅ Manejo de errores mejorado
- ✅ Estados de carga consistentes
- ✅ Validaciones en formularios
- ✅ Filtros con comodines
- ✅ Gráficos visuales (barras simples)
- ✅ Navegación intuitiva

### Backend
- ✅ Endpoint POST `/api/teacher/courses` para crear cursos
- ✅ Validación de código único
- ✅ Manejo de errores HTTP apropiado
- ✅ Procesamiento de CSV robusto

## 📝 Notas Importantes

1. **Creación de cursos:** Los cursos se pueden crear manualmente O automáticamente al subir CSV
2. **Vínculo de estudiantes:** Los estudiantes se vinculan automáticamente al curso cuando se procesa el CSV
3. **Bitácora:** La bitácora muestra información derivada de las estadísticas del curso
4. **Validaciones:** Todas las validaciones están implementadas según los criterios de aceptación

## ✅ Checklist de Pruebas

- [ ] Login docente → entra a /teacher
- [ ] Crear curso → POST backend → aparece en "Mis cursos"
- [ ] Subir CSV de ese curso → backend lo procesa
- [ ] Ver curso → tabla con estudiantes/ejercicios
- [ ] Ver estadísticas → números coherentes con ese CSV
- [ ] Login estudiante (que aparecía en el CSV) → /student/grades/curso → ve sus ejercicios
- [ ] Filtrar estudiantes con comodines
- [ ] Ver podios de estudiantes y ejercicios
- [ ] Ver bitácora de entregas

