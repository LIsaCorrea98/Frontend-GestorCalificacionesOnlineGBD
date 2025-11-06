import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "../../styles/student.module.css";

export default function StudentExerciseDetail() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener todas las calificaciones para encontrar este ejercicio
        const allGrades = await api.getAllStudentGrades();
        const exerciseData = allGrades
          .flatMap(course => course.exerciseGrades || [])
          .find(ex => ex.exerciseId === exerciseId);

        if (exerciseData) {
          setExercise({
            id: exerciseData.exerciseId,
            nombre: exerciseData.exerciseName,
            nota: exerciseData.score,
            estado: exerciseData.status === 'CORRECT' ? 'correcto' : 
                    exerciseData.status === 'INCORRECT' ? 'incorrecto' :
                    exerciseData.status === 'PENDING' ? 'pendiente' : 'no-entregado',
            status: exerciseData.status,
            submittedAt: exerciseData.submittedAt,
            maxScore: exerciseData.maxScore || 100,
            statusDescription: exerciseData.statusDescription
          });
        } else {
          setError("Ejercicio no encontrado");
        }
      } catch (err) {
        console.error("Error fetching exercise:", err);
        setError(err.message || "Error al cargar el ejercicio");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [exerciseId]);

  if (loading) {
    return (
      <div className={styles.grid} style={{gap:20}}>
        <section className={styles.card}>
          <div className="loading">Cargando detalles del ejercicio...</div>
        </section>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className={styles.grid} style={{gap:20}}>
        <section className={styles.card}>
          <div className="error-message">{error || "Ejercicio no encontrado"}</div>
          <button className={`${styles.btn} ${styles.primary}`} onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </section>
      </div>
    );
  }

  const icon = () => {
    if (exercise.estado === "correcto") return <span className={`${styles.state} ${styles.green}`} style={{fontSize: '48px'}}>✅</span>;
    if (exercise.estado === "incorrecto") return <span className={`${styles.state} ${styles.red}`} style={{fontSize: '48px'}}>❌</span>;
    if (exercise.estado === "pendiente") return <span className={`${styles.state} ${styles.yellow}`} style={{fontSize: '48px'}}>⚠️</span>;
    return <span className={`${styles.state} ${styles.gray}`} style={{fontSize: '48px'}}>➖</span>;
  };

  const getStatusColor = () => {
    if (exercise.estado === "correcto") return '#16a34a';
    if (exercise.estado === "incorrecto") return '#dc2626';
    if (exercise.estado === "pendiente") return '#ca8a04';
    return '#6b7280';
  };

  return (
    <div className={styles.grid} style={{gap:20}}>
      <section className={styles.card}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 24}}>
          <div>
            <h3>Detalle del Ejercicio</h3>
            <p className={styles.meta}>Información completa de tu calificación</p>
          </div>
          <button className={`${styles.btn} ${styles.ghost}`} onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>
      </section>

      <section className={styles.card}>
        <div style={{textAlign: 'center', marginBottom: 32}}>
          {icon()}
          <h2 style={{marginTop: 16, marginBottom: 8}}>{exercise.nombre}</h2>
          <span 
            className={styles.badge}
            style={{
              background: getStatusColor() + '20',
              color: getStatusColor(),
              fontSize: '14px',
              padding: '8px 16px'
            }}
          >
            {exercise.statusDescription || exercise.estado.toUpperCase()}
          </span>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20}}>
          <div style={{padding: 20, background: '#f9fafb', borderRadius: 12}}>
            <div className={styles.meta}>Calificación</div>
            <div style={{fontSize: 36, fontWeight: 700, color: getStatusColor(), marginTop: 8}}>
              {exercise.nota !== null ? `${exercise.nota} / ${exercise.maxScore}` : 'N/A'}
            </div>
            {exercise.nota !== null && (
              <div className={styles.progressWrap} style={{marginTop: 12}}>
                <div 
                  className={styles.progressBar} 
                  style={{
                    width: `${(exercise.nota / exercise.maxScore) * 100}%`,
                    background: getStatusColor()
                  }}
                />
              </div>
            )}
          </div>

          <div style={{padding: 20, background: '#f9fafb', borderRadius: 12}}>
            <div className={styles.meta}>Estado</div>
            <div style={{fontSize: 24, fontWeight: 600, marginTop: 8, color: getStatusColor()}}>
              {exercise.statusDescription || exercise.estado.replace("-"," ").replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          </div>

          {exercise.submittedAt && (
            <div style={{padding: 20, background: '#f9fafb', borderRadius: 12}}>
              <div className={styles.meta}>Fecha de Entrega</div>
              <div style={{fontSize: 18, fontWeight: 600, marginTop: 8}}>
                {new Date(exercise.submittedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>

        {exercise.estado === 'no-entregado' && (
          <div style={{
            marginTop: 24,
            padding: 16,
            background: '#fef3c7',
            borderRadius: 12,
            border: '1px solid #fbbf24'
          }}>
            <strong>⚠️ Ejercicio no entregado</strong>
            <p className={styles.meta} style={{marginTop: 8}}>
              Este ejercicio aún no ha sido entregado. Asegúrate de completarlo y subirlo en la plataforma correspondiente.
            </p>
          </div>
        )}

        {exercise.estado === 'pendiente' && (
          <div style={{
            marginTop: 24,
            padding: 16,
            background: '#fef3c7',
            borderRadius: 12,
            border: '1px solid #fbbf24'
          }}>
            <strong>⚠️ Ejercicio pendiente de revisión</strong>
            <p className={styles.meta} style={{marginTop: 8}}>
              Este ejercicio está siendo evaluado. La calificación estará disponible pronto.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
