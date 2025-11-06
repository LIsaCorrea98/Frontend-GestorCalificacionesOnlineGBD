// src/pages/teacher/TeacherCourses.jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "../../styles/teacher.module.css";

export default function TeacherCourses() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseIdParam = searchParams.get('courseId');
  
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getTeacherCourses();
        setCursos(data || []);
        
        // Si hay un courseId en la URL, cargar ese curso
        if (courseIdParam && data.length > 0) {
          const course = data.find(c => c.id === courseIdParam);
          if (course) {
            setSelectedCourse(course);
            await loadCourseStatistics(course.id);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseIdParam]);

  const loadCourseStatistics = async (courseId) => {
    try {
      const stats = await api.getCourseStatistics(courseId);
      setStatistics(stats);
      setFilteredStudents(stats.studentPerformance || []);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    setSearchFilter("");
    await loadCourseStatistics(course.id);
    navigate(`/teacher/courses?courseId=${course.id}`);
  };

  const handleFilter = (searchTerm) => {
    setSearchFilter(searchTerm);
    if (!statistics || !statistics.studentPerformance) return;
    
    if (!searchTerm.trim()) {
      setFilteredStudents(statistics.studentPerformance);
      return;
    }

    // Filtrado con comodines (soporta * y ?)
    const pattern = searchTerm
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escapar caracteres especiales de regex
      .replace(/\*/g, '.*') // * = cualquier secuencia
      .replace(/\?/g, '.');  // ? = un solo carácter
    
    const regex = new RegExp(pattern, 'i');
    
    const filtered = statistics.studentPerformance.filter(student => 
      regex.test(student.studentName) || 
      regex.test(student.studentEmail) ||
      (student.studentEmail && student.studentEmail.includes(searchTerm))
    );
    
    setFilteredStudents(filtered);
  };

  if (loading) {
    return (
      <div className={styles.grid} style={{gap:24}}>
        <section className={styles.card}>
          <div style={{textAlign: 'center', padding: '40px'}}>
            <div className="spinner" style={{margin: '0 auto 16px'}}></div>
            <p className={styles.muted}>Cargando cursos...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.grid} style={{gap:24}}>
      <div className={styles.topbar}>
        <div>
          <div className={styles.crumbs}>Profesor / Cursos</div>
          <h2>Gestión de Cursos</h2>
        </div>
        <button className={`${styles.btn} ${styles.primary}`} onClick={() => navigate('/teacher/upload')}>
          📤 Subir CSV
        </button>
      </div>

      {/* Selector de curso */}
      <section className={styles.card}>
        <h3>Seleccionar Curso</h3>
        {cursos.length === 0 ? (
          <p className={styles.muted}>No hay cursos disponibles. Suba un CSV para crear un curso.</p>
        ) : (
          <div className={styles.actions} style={{marginTop: 16, flexWrap: 'wrap'}}>
            {cursos.map(c => (
              <button
                key={c.id}
                className={`${styles.btn} ${selectedCourse?.id === c.id ? styles.primary : styles.outline}`}
                onClick={() => handleCourseSelect(c)}
              >
                {c.name || c.courseName}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Vista de calificaciones del curso seleccionado */}
      {selectedCourse && statistics && (
        <>
          {/* Resumen del curso */}
          <section className={styles.card}>
            <div className={styles.headerRow}>
              <div>
                <h3>{selectedCourse.name || selectedCourse.courseName}</h3>
                <p className={styles.muted}>
                  {statistics.totalStudents} estudiantes • {statistics.totalExercises} ejercicios
                </p>
              </div>
              <div className={styles.actions}>
                <button 
                  className={`${styles.btn} ${styles.outline}`}
                  onClick={() => navigate(`/teacher/stats?courseId=${selectedCourse.id}`)}
                >
                  📊 Ver Estadísticas Completas
                </button>
              </div>
            </div>
            
            {/* KPIs rápidos */}
            <div className={`${styles.grid} ${styles.kpis}`} style={{marginTop: 20}}>
              <div className={styles.card}>
                <h4>Promedio General</h4>
                <strong style={{fontSize: 28}}>{statistics.averageScore.toFixed(1)}</strong>
              </div>
              <div className={styles.card}>
                <h4>Correctos</h4>
                <strong style={{fontSize: 28}}>{statistics.correctSubmissions}</strong>
              </div>
              <div className={styles.card}>
                <h4>Incorrectos</h4>
                <strong style={{fontSize: 28}}>{statistics.incorrectSubmissions}</strong>
              </div>
              <div className={styles.card}>
                <h4>Pendientes</h4>
                <strong style={{fontSize: 28}}>{statistics.pendingSubmissions}</strong>
              </div>
            </div>
          </section>

          {/* Tabla de calificaciones con filtros */}
          <section className={styles.card}>
            <div className={styles.toolbar}>
              <h3 style={{marginRight: 'auto'}}>Calificaciones de Estudiantes</h3>
              <div className={styles.search}>
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por nombre o email (ej: *García, juan@*)"
                  value={searchFilter}
                  onChange={(e) => handleFilter(e.target.value)}
                />
              </div>
            </div>
            
            {filteredStudents.length === 0 ? (
              <p className={styles.muted} style={{textAlign: 'center', padding: '40px'}}>
                {searchFilter ? 'No se encontraron estudiantes con ese criterio.' : 'No hay estudiantes inscritos.'}
              </p>
            ) : (
              <div className={styles.preview}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Email</th>
                      <th>Correctos</th>
                      <th>Incorrectos</th>
                      <th>Pendientes</th>
                      <th>No Entregados</th>
                      <th>Promedio</th>
                      <th>% Completado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, idx) => (
                      <tr key={idx}>
                        <td><strong>{student.studentName}</strong></td>
                        <td className={styles.muted}>{student.studentEmail}</td>
                        <td>
                          <span className={`${styles.badge} ${styles.success}`}>
                            {student.correctCount}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${styles.danger}`}>
                            {student.incorrectCount}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${styles.warning}`}>
                            {student.pendingCount}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.badge}`}>
                            {student.notSubmittedCount}
                          </span>
                        </td>
                        <td><strong>{student.averageScore.toFixed(1)}</strong></td>
                        <td>
                          <div className={styles.progressWrap}>
                            <div 
                              className={styles.progressBar} 
                              style={{width: `${student.completionPercentage}%`}}
                            />
                          </div>
                          <small className={styles.muted}>{student.completionPercentage.toFixed(1)}%</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {!selectedCourse && cursos.length > 0 && (
        <section className={styles.card}>
          <p className={styles.muted} style={{textAlign: 'center', padding: '40px'}}>
            Seleccione un curso para ver las calificaciones
          </p>
        </section>
      )}
    </div>
  );
}
