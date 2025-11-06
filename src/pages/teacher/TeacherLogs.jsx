// src/pages/teacher/TeacherLogs.jsx - Bitácora de entregas
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import styles from "../../styles/teacher.module.css";

export default function TeacherLogs() {
  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get('courseId');
  
  const [cursos, setCursos] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentFilter, setStudentFilter] = useState("");
  const [exerciseFilter, setExerciseFilter] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getTeacherCourses();
        setCursos(data || []);
        
        if (courseIdParam && data.length > 0) {
          const course = data.find(c => c.id === courseIdParam);
          if (course) {
            setSelectedCourse(course);
            await loadLogs(course.id);
          }
        } else if (data.length > 0) {
          setSelectedCourse(data[0]);
          await loadLogs(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseIdParam]);

  const loadLogs = async (courseId) => {
    try {
      const stats = await api.getCourseStatistics(courseId);
      setStatistics(stats);
      buildLogsFromStatistics(stats);
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  const buildLogsFromStatistics = (stats) => {
    // Construir bitácora desde las estadísticas
    const logs = [];
    
    if (stats.studentPerformance && stats.exerciseStatistics) {
      // Para cada estudiante, obtener sus calificaciones
      stats.studentPerformance.forEach(student => {
        // Necesitamos obtener las calificaciones detalladas
        // Por ahora, usamos la información disponible
        // En un backend completo, esto vendría de un endpoint específico
        logs.push({
          studentName: student.studentName,
          studentEmail: student.studentEmail,
          correctCount: student.correctCount,
          incorrectCount: student.incorrectCount,
          pendingCount: student.pendingCount,
          notSubmittedCount: student.notSubmittedCount,
          averageScore: student.averageScore,
          completionPercentage: student.completionPercentage
        });
      });
    }
    
    setFilteredLogs(logs);
  };

  const handleCourseChange = async (courseId) => {
    const course = cursos.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setStudentFilter("");
      setExerciseFilter("");
      await loadLogs(courseId);
    }
  };

  useEffect(() => {
    if (!statistics) return;
    
    let filtered = [];
    
    // Construir logs desde estadísticas
    if (statistics.studentPerformance) {
      statistics.studentPerformance.forEach(student => {
        filtered.push({
          studentName: student.studentName,
          studentEmail: student.studentEmail,
          correctCount: student.correctCount,
          incorrectCount: student.incorrectCount,
          pendingCount: student.pendingCount,
          notSubmittedCount: student.notSubmittedCount,
          averageScore: student.averageScore,
          completionPercentage: student.completionPercentage
        });
      });
    }
    
    // Aplicar filtros
    if (studentFilter.trim()) {
      const pattern = studentFilter
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      const regex = new RegExp(pattern, 'i');
      
      filtered = filtered.filter(log => 
        regex.test(log.studentName) || 
        regex.test(log.studentEmail)
      );
    }
    
    setFilteredLogs(filtered);
  }, [statistics, studentFilter, exerciseFilter]);

  if (loading) {
    return (
      <div className={styles.grid} style={{gap:24}}>
        <section className={styles.card}>
          <div style={{textAlign: 'center', padding: '40px'}}>
            <div className="spinner" style={{margin: '0 auto 16px'}}></div>
            <p className={styles.muted}>Cargando bitácora...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!statistics || !selectedCourse) {
    return (
      <div className={styles.grid} style={{gap:24}}>
        <div className={styles.topbar}>
          <div>
            <div className={styles.crumbs}>Profesor / Bitácora de Entregas</div>
            <h2>Bitácora de Entregas</h2>
          </div>
        </div>
        <section className={styles.card}>
          <p className={styles.muted}>No hay cursos disponibles. Suba un CSV para crear un curso.</p>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.grid} style={{gap:24}}>
      <div className={styles.topbar}>
        <div>
          <div className={styles.crumbs}>Profesor / Bitácora de Entregas</div>
          <h2>Bitácora de Entregas</h2>
        </div>
        {cursos.length > 1 && (
          <select 
            className={styles.select}
            value={selectedCourse.id}
            onChange={(e) => handleCourseChange(e.target.value)}
          >
            {cursos.map(c => (
              <option key={c.id} value={c.id}>{c.name || c.courseName}</option>
            ))}
          </select>
        )}
      </div>

      {/* Información del curso */}
      <section className={styles.card}>
        <h3>{selectedCourse.name || selectedCourse.courseName}</h3>
        <p className={styles.muted}>
          {statistics.totalStudents} estudiantes • {statistics.totalExercises} ejercicios
        </p>
      </section>

      {/* Filtros */}
      <section className={styles.card}>
        <h3>Filtros</h3>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Buscar por estudiante (ej: *García, juan@*)"
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Tabla de bitácora */}
      <section className={styles.card}>
        <h3>Bitácora de Entregas por Estudiante</h3>
        <div className={styles.preview}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Email</th>
                <th>✅ Correctos</th>
                <th>❌ Incorrectos</th>
                <th>⚠️ Pendientes</th>
                <th>➖ No Entregados</th>
                <th>Promedio</th>
                <th>% Completado</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{textAlign: 'center', padding: '40px'}}>
                    <p className={styles.muted}>
                      {studentFilter ? 'No se encontraron estudiantes con ese criterio.' : 'No hay entregas registradas.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td><strong>{log.studentName}</strong></td>
                    <td className={styles.muted}>{log.studentEmail}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.success}`}>
                        {log.correctCount}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.danger}`}>
                        {log.incorrectCount}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.warning}`}>
                        {log.pendingCount}
                      </span>
                    </td>
                    <td>
                      <span className={styles.badge}>
                        {log.notSubmittedCount}
                      </span>
                    </td>
                    <td><strong>{log.averageScore.toFixed(1)}</strong></td>
                    <td>
                      <div className={styles.progressWrap}>
                        <div 
                          className={styles.progressBar} 
                          style={{width: `${log.completionPercentage}%`}}
                        />
                      </div>
                      <small className={styles.muted}>{log.completionPercentage.toFixed(1)}%</small>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bitácora por ejercicio */}
      <section className={styles.card}>
        <h3>Bitácora de Entregas por Ejercicio</h3>
        <div className={styles.preview}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ejercicio</th>
                <th>✅ Correctos</th>
                <th>❌ Incorrectos</th>
                <th>⚠️ Pendientes</th>
                <th>➖ No Entregados</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {statistics.exerciseStatistics && statistics.exerciseStatistics.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>
                    <p className={styles.muted}>No hay ejercicios registrados.</p>
                  </td>
                </tr>
              ) : (
                (statistics.exerciseStatistics || []).map((exercise, idx) => (
                  <tr key={idx}>
                    <td><strong>{exercise.exerciseName}</strong></td>
                    <td>
                      <span className={`${styles.badge} ${styles.success}`}>
                        {exercise.correctSubmissions}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.danger}`}>
                        {exercise.incorrectSubmissions}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.warning}`}>
                        {exercise.pendingSubmissions}
                      </span>
                    </td>
                    <td>
                      <span className={styles.badge}>
                        {exercise.notSubmittedCount}
                      </span>
                    </td>
                    <td><strong>{exercise.averageScore.toFixed(1)}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

