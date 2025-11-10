// src/pages/teacher/TeacherDashboard.jsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "../../styles/teacher.module.css";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  // 1. hooks SIEMPRE al inicio
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({
    cursosActivos: 0,
    estudiantesInscritos: 0,
    ultimaCarga: "",
    aprobacionGlobal: 0,
  });
  const [cursos, setCursos] = useState([]);

  // estados para modales (deben ir antes de cualquier return)
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    periodo: "2025-1",
  });

  // 2. cargar data - función reusable
  const fetchCourses = async () => {
    try {
      const data = await api.getTeacherCourses();
      const list = data || [];
      setCursos(list);

      const totalStudents =
        list.reduce((sum, c) => sum + (c.totalStudents || 0), 0) || 0;
      const lastCourse = list[list.length - 1];

      setKpi({
        cursosActivos: list.length,
        estudiantesInscritos: totalStudents,
        ultimaCarga: lastCourse?.createdAt
          ? new Date(lastCourse.createdAt).toLocaleDateString()
          : "",
        aprobacionGlobal: lastCourse?.averageScore || 0,
      });
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 3. derivados (useMemo) – ya hay cursos declarado arriba, así que no hay riesgo
  const ultimoCurso = useMemo(() => {
    if (!cursos.length) return "—";
    const last = cursos[cursos.length - 1];
    return last.name || last.courseName || "—";
  }, [cursos]);

  // 4. handlers
  const onOpenCreate = () => {
    setForm({
      nombre: "",
      codigo: "",
      descripcion: "",
      periodo: "2025-1",
    });
    setShowCreate(true);
  };

  const onCreate = async () => {
    if (!form.nombre.trim() || !form.codigo.trim()) {
      alert("Complete el nombre y código del curso");
      return;
    }
    
    try {
      const newCourse = await api.createCourse({
        name: form.nombre.trim(),
        courseCode: form.codigo.trim(),
        description: form.descripcion.trim() || ""
      });
      
      // Recargar la lista de cursos
      await fetchCourses();
      
      setShowCreate(false);
      setForm({ nombre: "", codigo: "", descripcion: "", periodo: "2025-1" });
      alert("Curso creado exitosamente");
    } catch (error) {
      console.error("Error creating course:", error);
      const errorMessage = error.message || "Error al crear el curso. Verifique su conexión y que el backend esté corriendo.";
      alert(errorMessage);
    }
  };

  const onOpenEdit = (c) => {
    setShowEdit(c);
    setForm({
      nombre: c.name || c.courseName || "",
      codigo: c.courseCode || "",
      descripcion: c.description || "",
      periodo: c.period || "2025-1",
    });
  };

  const onEdit = () => {
    alert("La edición de cursos está pendiente de implementación en el backend.");
    setShowEdit(null);
  };

  const onConfirmDelete = (id) => setConfirmDelete(id);

  const onDelete = () => {
    alert("La eliminación de cursos está pendiente de implementación en el backend.");
    setConfirmDelete(null);
  };

  const goVer = (c) => navigate(`/teacher/courses?courseId=${c.id}`);

  // 5. ahora sí, retornos condicionales
  if (loading) {
    return (
      <div className={styles.grid} style={{ gap: 24 }}>
        <section className={styles.card}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p className={styles.muted}>Cargando datos del profesor...</p>
          </div>
        </section>
      </div>
    );
  }

  // 6. render normal
  return (
    <div className={styles.grid} style={{ gap: 24 }}>
      {/* TOPBAR */}
      <div className={styles.topbar}>
        <div>
          <div className={styles.crumbs}>Profesor / Dashboard</div>
          <h2>Panel de control</h2>
        </div>
        <button
          className={`${styles.btn} ${styles.primary}`}
          onClick={onOpenCreate}
        >
          + Crear Curso
        </button>
      </div>

      {/* KPIs */}
      <section className={`${styles.kpis} ${styles.grid}`}>
        <div className={styles.card} style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>📚</span>
            <h4 style={{ color: '#fff', margin: 0 }}>Cursos activos</h4>
          </div>
          <strong style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>{kpi.cursosActivos}</strong>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: 12, display: 'inline-block' }}>
            Último: {ultimoCurso}
          </div>
        </div>
        <div className={styles.card} style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#fff',
          border: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>👥</span>
            <h4 style={{ color: '#fff', margin: 0 }}>Estudiantes inscritos</h4>
          </div>
          <strong style={{ fontSize: 36, display: 'block' }}>{kpi.estudiantesInscritos}</strong>
        </div>
        <div className={styles.card} style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: '#fff',
          border: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>📅</span>
            <h4 style={{ color: '#fff', margin: 0 }}>Última carga</h4>
          </div>
          <strong style={{ fontSize: 24, display: 'block' }}>{kpi.ultimaCarga || "—"}</strong>
        </div>
        <div className={styles.card} style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: '#fff',
          border: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>✅</span>
            <h4 style={{ color: '#fff', margin: 0 }}>Aprobación global</h4>
          </div>
          <strong style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>{kpi.aprobacionGlobal}%</strong>
          <div className={styles.progressWrap} style={{ background: 'rgba(255,255,255,0.3)' }}>
            <div
              className={styles.progressBar}
              style={{ 
                width: `${kpi.aprobacionGlobal}%`,
                background: 'rgba(255,255,255,0.9)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Tabla de cursos */}
      <section className={styles.card}>
        <div className={styles.actions}>
          <h3 style={{ marginRight: "auto" }}>Mis cursos</h3>
          <button
            className={`${styles.btn} ${styles.primary}`}
            onClick={() => navigate("/teacher/upload")}
          >
            📤 Subir CSV
          </button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Progreso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                  No hay cursos todavía. Cree uno nuevo.
                </td>
              </tr>
            ) : (
              cursos.map((c) => (
                <tr key={c.id}>
                  <td>{c.name || c.courseName}</td>
                  <td style={{ minWidth: 160 }}>
                    <div className={styles.progressWrap}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${c.isActive ? 100 : 0}%` }}
                      />
                    </div>
                    <small style={{ color: "#64748b" }}>
                      {c.isActive ? "Activo" : "Inactivo"}
                    </small>
                  </td>
                  <td className={styles.actions}>
                    <button
                      className={`${styles.btn} ${styles.primary}`}
                      onClick={() => goVer(c)}
                    >
                      Ver Detalles
                    </button>
                    <button
                      className={`${styles.btn} ${styles.outline}`}
                      onClick={() =>
                        navigate(`/teacher/stats?courseId=${c.id}`)
                      }
                    >
                      📊 Estadísticas
                    </button>
                    {/* si quieres editar/eliminar en la tabla:
                    <button className={styles.btn} onClick={() => onOpenEdit(c)}>Editar</button>
                    <button className={`${styles.btn} ${styles.danger}`} onClick={() => onConfirmDelete(c.id)}>Eliminar</button>
                    */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* MODAL: Crear Curso */}
      {showCreate && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowCreate(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header>
              <h3>Crear curso</h3>
              <button
                className={styles.btn}
                onClick={() => setShowCreate(false)}
              >
                ✕
              </button>
            </header>
            <div className="body">
              <div style={{ display: "grid", gap: 10 }}>
                <label>
                  Nombre del curso
                  <input
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                    }}
                    value={form.nombre}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, nombre: e.target.value }))
                    }
                    placeholder="Ej. Fundamentos"
                  />
                </label>
                <label>
                  Código del curso *
                  <input
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                    }}
                    value={form.codigo}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, codigo: e.target.value }))
                    }
                    placeholder="Ej. PROG101"
                  />
                </label>
                <label>
                  Periodo
                  <input
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                    }}
                    value={form.periodo}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, periodo: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Descripción (opcional)
                  <textarea
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      minHeight: 80,
                    }}
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, descripcion: e.target.value }))
                    }
                    placeholder="Descripción del curso"
                  />
                </label>
              </div>
            </div>
            <footer>
              <button
                className={styles.btn}
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </button>
              <button
                className={`${styles.btn} ${styles.primary}`}
                onClick={onCreate}
              >
                Crear
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL: Editar Curso */}
      {showEdit && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowEdit(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header>
              <h3>Editar curso</h3>
              <button className={styles.btn} onClick={() => setShowEdit(null)}>
                ✕
              </button>
            </header>
            <div className="body">
              <div style={{ display: "grid", gap: 10 }}>
                <label>
                  Nombre del curso
                  <input
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                    }}
                    value={form.nombre}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, nombre: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Periodo
                  <input
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                    }}
                    value={form.periodo}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, periodo: e.target.value }))
                    }
                  />
                </label>
              </div>
            </div>
            <footer>
              <button className={styles.btn} onClick={() => setShowEdit(null)}>
                Cancelar
              </button>
              <button
                className={`${styles.btn} ${styles.primary}`}
                onClick={onEdit}
              >
                Guardar
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar Eliminación */}
      {confirmDelete && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setConfirmDelete(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header>
              <h3>Eliminar curso</h3>
              <button
                className={styles.btn}
                onClick={() => setConfirmDelete(null)}
              >
                ✕
              </button>
            </header>
            <div className="body">
              <p>Esta acción no se puede deshacer. ¿Deseas eliminar este curso?</p>
            </div>
            <footer>
              <button
                className={styles.btn}
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
              <button
                className={`${styles.btn} ${styles.danger}`}
                onClick={onDelete}
              >
                Eliminar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
