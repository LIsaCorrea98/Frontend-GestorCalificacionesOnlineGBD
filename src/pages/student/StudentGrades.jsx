import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "../../styles/student.module.css";

export default function StudentGrades() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [curso, setCurso] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getStudentGradesForCourse(courseId);
        setCurso({
          id: data.courseId,
          nombre: data.courseName
        });
        
        // Map backend data to frontend format
        const mappedExercises = data.exerciseGrades?.map(ex => ({
          id: ex.exerciseId,
          nombre: ex.exerciseName,
          nota: ex.score,
          estado: ex.status === 'CORRECT' ? 'correcto' : 
                  ex.status === 'INCORRECT' ? 'incorrecto' :
                  ex.status === 'PENDING' ? 'pendiente' : 'no-entregado',
          status: ex.status,
          submittedAt: ex.submittedAt
        })) || [];
        
        setEjercicios(mappedExercises);
        setFilteredExercises(mappedExercises);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  useEffect(() => {
    // Filtrar ejercicios por estado
    if (statusFilter === "all") {
      setFilteredExercises(ejercicios);
    } else {
      const filterMap = {
        "correctos": "CORRECT",
        "incorrectos": "INCORRECT",
        "pendientes": "PENDING",
        "no-entregados": "NOT_SUBMITTED"
      };
      
      const filtered = ejercicios.filter(ex => ex.status === filterMap[statusFilter]);
      setFilteredExercises(filtered);
    }
  }, [statusFilter, ejercicios]);

  if (loading) {
    return (
      <div className={styles.grid} style={{gap:20}}>
        <section className={styles.card}>
          <div style={{textAlign: 'center', padding: '40px'}}>
            <div className="spinner" style={{margin: '0 auto 16px'}}></div>
            <p className={styles.meta}>Cargando calificaciones...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className={styles.grid} style={{gap:20}}>
        <section className={styles.card}>
          <div className="error-message">Curso no encontrado</div>
          <button className={`${styles.btn} ${styles.primary}`} onClick={() => navigate('/student')}>
            ← Volver al Dashboard
          </button>
        </section>
      </div>
    );
  }

  // Calcular estadísticas
  const stats = {
    correctos: ejercicios.filter(e => e.estado === 'correcto').length,
    incorrectos: ejercicios.filter(e => e.estado === 'incorrecto').length,
    pendientes: ejercicios.filter(e => e.estado === 'pendiente').length,
    noEntregados: ejercicios.filter(e => e.estado === 'no-entregado').length,
    total: ejercicios.length,
    promedio: ejercicios.filter(e => e.nota !== null).reduce((sum, e) => sum + (e.nota || 0), 0) / 
              (ejercicios.filter(e => e.nota !== null).length || 1)
  };

  const icon = (estado) => {
    if (estado === "correcto") return <span className={`${styles.state} ${styles.green}`}>✅</span>;
    if (estado === "incorrecto") return <span className={`${styles.state} ${styles.red}`}>❌</span>;
    if (estado === "pendiente") return <span className={`${styles.state} ${styles.yellow}`}>⚠️</span>;
    return <span className={`${styles.state} ${styles.gray}`}>➖</span>;
  };

  // Función para crear gráfico de progreso visual
  const ProgressChart = () => {
    const maxValue = Math.max(stats.correctos, stats.incorrectos, stats.pendientes, stats.noEntregados, 1);
    
    return (
      <div className={styles.chartContainer}>
        <h4 style={{marginBottom: 16, fontSize: 16, fontWeight: 600}}>Distribución de Ejercicios</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>✅ Correctos</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{stats.correctos}</span>
            </div>
            <div className={styles.progressWrap}>
              <div 
                className={styles.progressBar} 
                style={{
                  width: `${(stats.correctos / maxValue) * 100}%`,
                  background: '#16a34a'
                }}
              />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>❌ Incorrectos</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{stats.incorrectos}</span>
            </div>
            <div className={styles.progressWrap}>
              <div 
                className={styles.progressBar} 
                style={{
                  width: `${(stats.incorrectos / maxValue) * 100}%`,
                  background: '#dc2626'
                }}
              />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>⚠️ Pendientes</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{stats.pendientes}</span>
            </div>
            <div className={styles.progressWrap}>
              <div 
                className={styles.progressBar} 
                style={{
                  width: `${(stats.pendientes / maxValue) * 100}%`,
                  background: '#ca8a04'
                }}
              />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>➖ No Entregados</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{stats.noEntregados}</span>
            </div>
            <div className={styles.progressWrap}>
              <div 
                className={styles.progressBar} 
                style={{
                  width: `${(stats.noEntregados / maxValue) * 100}%`,
                  background: '#6b7280'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.grid} style={{gap:20}}>
      <section className={styles.card}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16}}>
          <div>
            <h3>{curso.nombre} — Calificaciones</h3>
            <p className={styles.meta}>Promedio: <strong style={{color: '#2563eb', fontSize: '18px'}}>{stats.promedio.toFixed(1)}</strong></p>
          </div>
          <button className={`${styles.btn} ${styles.ghost}`} onClick={() => navigate('/student')}>
            ← Volver
          </button>
        </div>
      </section>

      {/* KPIs rápidos */}
      <section className={`${styles.grid} ${styles.kpis}`}>
        <div className={styles.card}>
          <div className={styles.meta}>Total Ejercicios</div>
          <div className={styles.big}>{stats.total}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.meta}>✅ Correctos</div>
          <div className={styles.big} style={{color: '#16a34a'}}>{stats.correctos}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.meta}>❌ Incorrectos</div>
          <div className={styles.big} style={{color: '#dc2626'}}>{stats.incorrectos}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.meta}>⚠️ Pendientes</div>
          <div className={styles.big} style={{color: '#ca8a04'}}>{stats.pendientes}</div>
        </div>
      </section>

      {/* Gráfico de progreso */}
      <section className={styles.card}>
        <h3>Resumen Visual de Progreso</h3>
        <ProgressChart />
      </section>

      {/* Filtros y lista de ejercicios */}
      <section className={styles.card}>
        <div style={{display:"flex",gap:12, flexWrap:"wrap", marginBottom: 16}}>
          <button 
            className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Todos ({stats.total})
          </button>
          <button 
            className={`${styles.filterBtn} ${statusFilter === 'correctos' ? styles.active : ''}`}
            onClick={() => setStatusFilter('correctos')}
          >
            ✅ Correctos ({stats.correctos})
          </button>
          <button 
            className={`${styles.filterBtn} ${statusFilter === 'incorrectos' ? styles.active : ''}`}
            onClick={() => setStatusFilter('incorrectos')}
          >
            ❌ Incorrectos ({stats.incorrectos})
          </button>
          <button 
            className={`${styles.filterBtn} ${statusFilter === 'pendientes' ? styles.active : ''}`}
            onClick={() => setStatusFilter('pendientes')}
          >
            ⚠️ Pendientes ({stats.pendientes})
          </button>
          <button 
            className={`${styles.filterBtn} ${statusFilter === 'no-entregados' ? styles.active : ''}`}
            onClick={() => setStatusFilter('no-entregados')}
          >
            ➖ No Entregados ({stats.noEntregados})
          </button>
        </div>

        {/* Lista visual de ejercicios */}
        <div className={styles.list} style={{marginTop:12}}>
          {filteredExercises.length === 0 ? (
            <p className={styles.meta} style={{textAlign: 'center', padding: '40px'}}>
              No hay ejercicios con el estado seleccionado.
            </p>
          ) : (
            filteredExercises.map(e => (
              <div key={e.id} className={styles.row}>
                <div className={styles.left}>
                  {icon(e.estado)}
                  <div>
                    <div><strong>{e.nombre}</strong></div>
                    <div className={styles.meta}>
                      Estado: {e.estado.replace("-"," ").replace(/\b\w/g, l => l.toUpperCase())}
                      {e.submittedAt && ` • Fecha: ${new Date(e.submittedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  {e.nota !== null ? (
                    <strong style={{fontSize: '18px', color: e.estado === 'correcto' ? '#16a34a' : '#dc2626'}}>
                      {e.nota}
                    </strong>
                  ) : (
                    <span className={styles.meta}>Sin nota</span>
                  )}
                  <button 
                    className={`${styles.btn} ${styles.ghost}`}
                    onClick={() => navigate(`/student/exercise/${e.id}`)}
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
