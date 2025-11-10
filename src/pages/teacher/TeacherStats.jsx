// src/pages/teacher/TeacherStats.jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "../../styles/teacher.module.css";

export default function TeacherStats() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseIdParam = searchParams.get('courseId');
  
  const [cursos, setCursos] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getTeacherCourses();
        setCursos(data || []);
        
        if (courseIdParam && data.length > 0) {
          const course = data.find(c => c.id === courseIdParam);
          if (course) {
            setSelectedCourse(course);
            await loadStatistics(course.id);
          } else if (data.length > 0) {
            // Si no se encuentra el curso, seleccionar el primero
            setSelectedCourse(data[0]);
            await loadStatistics(data[0].id);
          }
        } else if (data.length > 0) {
          setSelectedCourse(data[0]);
          await loadStatistics(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseIdParam]);

  const loadStatistics = async (courseId) => {
    try {
      const stats = await api.getCourseStatistics(courseId);
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const handleCourseChange = async (courseId) => {
    const course = cursos.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      await loadStatistics(courseId);
      navigate(`/teacher/stats?courseId=${courseId}`);
    }
  };

  if (loading) {
    return <div className={styles.card}>Cargando estadísticas...</div>;
  }

  if (!statistics || !selectedCourse) {
    return (
      <div className={styles.grid} style={{gap:24}}>
        <div className={styles.topbar}>
          <div>
            <div className={styles.crumbs}>Profesor / Estadísticas</div>
            <h2>Estadísticas del Curso</h2>
          </div>
        </div>
        <section className={styles.card}>
          <p className={styles.muted}>No hay cursos disponibles. Suba un CSV para crear un curso.</p>
        </section>
      </div>
    );
  }

  // Calcular porcentajes
  const totalSubmissions = statistics.correctSubmissions + statistics.incorrectSubmissions + 
                          statistics.pendingSubmissions + statistics.notSubmittedCount;
  const approvalRate = totalSubmissions > 0 
    ? ((statistics.correctSubmissions / totalSubmissions) * 100).toFixed(1)
    : 0;
  
  // Calcular total de ejercicios posibles y entregas
  const totalPossible = statistics.totalExercises * statistics.totalStudents;
  const totalDelivered = statistics.correctSubmissions + statistics.incorrectSubmissions + statistics.pendingSubmissions;
  const deliveryPercentage = totalPossible > 0 
    ? ((totalDelivered / totalPossible) * 100).toFixed(1)
    : 0;

  // Podio de estudiantes (top 3 por ejercicios resueltos)
  const topStudents = [...(statistics.studentPerformance || [])]
    .sort((a, b) => (b.correctCount + b.incorrectCount) - (a.correctCount + a.incorrectCount))
    .slice(0, 3);

  // Podio de ejercicios (más acertados y más fallados)
  const topCorrectExercises = [...(statistics.exerciseStatistics || [])]
    .sort((a, b) => b.correctSubmissions - a.correctSubmissions)
    .slice(0, 3);
  
  const topFailedExercises = [...(statistics.exerciseStatistics || [])]
    .sort((a, b) => b.incorrectSubmissions - a.incorrectSubmissions)
    .slice(0, 3);

  // Función para crear gráfico simple de barras
  const BarChart = ({ data, labelKey, valueKey, color = '#2563eb', maxValue }) => {
    const max = maxValue || Math.max(...data.map(d => d[valueKey]));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
        {data.map((item, idx) => (
          <div key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{item[labelKey]}</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{item[valueKey]}</span>
            </div>
            <div className={styles.progressWrap}>
              <div 
                className={styles.progressBar} 
                style={{
                  width: `${(item[valueKey] / max) * 100}%`,
                  background: color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.grid} style={{gap:24}}>
      <div className={styles.topbar}>
        <div>
          <div className={styles.crumbs}>Profesor / Estadísticas</div>
          <h2>Estadísticas del Curso</h2>
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

      {/* KPIs principales */}
      <section className={`${styles.grid} ${styles.kpis}`}>
        <div className={styles.card} style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>📊</span>
            <h4 style={{ color: '#fff', margin: 0 }}>Promedio General</h4>
          </div>
          <strong style={{fontSize: 42, display: 'block', marginBottom: 12}}>{statistics.averageScore.toFixed(1)}</strong>
          <div className={styles.progressWrap} style={{background: 'rgba(255,255,255,0.3)'}}>
            <div 
              className={styles.progressBar} 
              style={{
                width: `${statistics.averageScore}%`,
                background: 'rgba(255,255,255,0.9)'
              }}
            />
          </div>
        </div>
        <div className={styles.card} style={{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: '#fff',
          border: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>✅</span>
            <h4 style={{ color: '#fff', margin: 0 }}>% Aprobación</h4>
          </div>
          <strong style={{fontSize: 42, display: 'block', marginBottom: 12}}>{approvalRate}%</strong>
          <div className={styles.progressWrap} style={{background: 'rgba(255,255,255,0.3)'}}>
            <div 
              className={styles.progressBar} 
              style={{
                width: `${approvalRate}%`,
                background: 'rgba(255,255,255,0.9)'
              }}
            />
          </div>
        </div>
        <div className={styles.card} style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          border: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>📤</span>
            <h4 style={{ margin: 0, color: '#1f2937' }}>Ejercicios Entregados</h4>
          </div>
          <strong style={{fontSize: 42, display: 'block', color: '#1f2937', marginBottom: 12}}>
            {totalDelivered}
          </strong>
          <div style={{ 
            background: 'rgba(255,255,255,0.7)', 
            padding: '12px', 
            borderRadius: '10px',
            fontSize: 13,
            color: '#1f2937'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontWeight: 500 }}>
              <span>De un total de:</span>
              <strong style={{ color: '#667eea' }}>{totalPossible} ejercicios</strong>
            </div>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#6b7280' }}>
              ({statistics.totalStudents} estudiantes × {statistics.totalExercises} ejercicios)
            </div>
            <div className={styles.progressWrap} style={{ background: 'rgba(0,0,0,0.1)', marginTop: 8, marginBottom: 8 }}>
              <div 
                className={styles.progressBar} 
                style={{
                  width: `${deliveryPercentage}%`,
                  background: 'linear-gradient(90deg, #667eea, #764ba2)'
                }}
              />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'center', color: '#1f2937' }}>
              {deliveryPercentage}% de tasa de entrega
            </div>
          </div>
        </div>
        <div className={styles.card} style={{
          background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
          color: '#fff',
          border: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>❌</span>
            <h4 style={{ color: '#fff', margin: 0 }}>No Entregados</h4>
          </div>
          <strong style={{fontSize: 42, display: 'block'}}>{statistics.notSubmittedCount}</strong>
        </div>
      </section>

      {/* Gráfico de distribución */}
      <section className={styles.card}>
        <h3>Distribución de Entregas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div>
            <div className={`${styles.badge} ${styles.success}`} style={{fontSize: '14px', padding: '8px 12px'}}>
              ✅ Correctos: {statistics.correctSubmissions}
            </div>
          </div>
          <div>
            <div className={`${styles.badge} ${styles.danger}`} style={{fontSize: '14px', padding: '8px 12px'}}>
              ❌ Incorrectos: {statistics.incorrectSubmissions}
            </div>
          </div>
          <div>
            <div className={`${styles.badge} ${styles.warning}`} style={{fontSize: '14px', padding: '8px 12px'}}>
              ⚠️ Pendientes: {statistics.pendingSubmissions}
            </div>
          </div>
          <div>
            <div className={styles.badge} style={{fontSize: '14px', padding: '8px 12px'}}>
              ➖ No Entregados: {statistics.notSubmittedCount}
            </div>
          </div>
        </div>
      </section>

      {/* Podio de Estudiantes */}
      <section className={styles.card}>
        <h3>🏆 Podio de Estudiantes</h3>
        <p className={styles.muted}>Top 3 estudiantes con más ejercicios resueltos</p>
        {topStudents.length === 0 ? (
          <p className={styles.muted} style={{textAlign: 'center', padding: '20px'}}>
            No hay datos de estudiantes disponibles
          </p>
        ) : (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topStudents.map((student, idx) => {
              const medals = ['🥇', '🥈', '🥉'];
              const totalSolved = student.correctCount + student.incorrectCount;
              return (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: idx === 0 ? '#fef3c7' : '#f9fafb',
                    borderRadius: '12px',
                    border: idx === 0 ? '2px solid #fbbf24' : '1px solid #e5e7eb'
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{medals[idx]}</span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '16px' }}>{student.studentName}</strong>
                    <p className={styles.muted} style={{ fontSize: '13px', marginTop: '4px' }}>
                      {student.studentEmail}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 600 }}>
                      {totalSolved} ejercicios
                    </div>
                    <div className={styles.muted} style={{ fontSize: '12px' }}>
                      {student.correctCount} correctos
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Podio de Ejercicios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Ejercicios más acertados */}
        <section className={styles.card}>
          <h3>✅ Ejercicios Más Acertados</h3>
          <p className={styles.muted}>Top 3 ejercicios con mayor cantidad de aciertos</p>
          {topCorrectExercises.length === 0 ? (
            <p className={styles.muted} style={{textAlign: 'center', padding: '20px'}}>
              No hay datos disponibles
            </p>
          ) : (
            <BarChart
              data={topCorrectExercises}
              labelKey="exerciseName"
              valueKey="correctSubmissions"
              color="#16a34a"
              maxValue={statistics.totalStudents}
            />
          )}
        </section>

        {/* Ejercicios más fallados */}
        <section className={styles.card}>
          <h3>❌ Ejercicios Más Fallados</h3>
          <p className={styles.muted}>Top 3 ejercicios con mayor cantidad de errores</p>
          {topFailedExercises.length === 0 ? (
            <p className={styles.muted} style={{textAlign: 'center', padding: '20px'}}>
              No hay datos disponibles
            </p>
          ) : (
            <BarChart
              data={topFailedExercises}
              labelKey="exerciseName"
              valueKey="incorrectSubmissions"
              color="#dc2626"
              maxValue={statistics.totalStudents}
            />
          )}
        </section>
      </div>

      {/* Tabla completa de ejercicios */}
      <section className={styles.card}>
        <h3>Estadísticas por Ejercicio</h3>
        <div className={styles.preview}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ejercicio</th>
                <th>Correctos</th>
                <th>Incorrectos</th>
                <th>Pendientes</th>
                <th>No Entregados</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {(statistics.exerciseStatistics || []).map((exercise, idx) => (
                <tr key={idx}>
                  <td><strong>{exercise.exerciseName}</strong></td>
                  <td><span className={`${styles.badge} ${styles.success}`}>{exercise.correctSubmissions}</span></td>
                  <td><span className={`${styles.badge} ${styles.danger}`}>{exercise.incorrectSubmissions}</span></td>
                  <td><span className={`${styles.badge} ${styles.warning}`}>{exercise.pendingSubmissions}</span></td>
                  <td><span className={styles.badge}>{exercise.notSubmittedCount}</span></td>
                  <td><strong>{exercise.averageScore.toFixed(1)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
