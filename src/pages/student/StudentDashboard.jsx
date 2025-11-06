import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import styles from "../../styles/student.module.css";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    entregados: 0,
    aprobados: 0,
    pendientes: 0,
    promedio: 0,
  });
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getStudentCourses();
        setCursos(data?.courses || []);

        // Calculate KPIs from all courses
        let totalCorrect = 0;
        let totalIncorrect = 0;
        let totalPending = 0;
        let totalNotSubmitted = 0;
        let totalExercises = 0;
        let totalScore = 0;
        let countWithScores = 0;

        // Fetch detailed data for each course to get accurate statistics
        for (const course of (data?.courses || [])) {
          try {
            const courseGrades = await api.getStudentGradesForCourse(course.courseId);
            totalCorrect += courseGrades.correctCount || 0;
            totalIncorrect += courseGrades.incorrectCount || 0;
            totalPending += courseGrades.pendingCount || 0;
            totalNotSubmitted += courseGrades.notSubmittedCount || 0;
            totalExercises += courseGrades.totalExercises || 0;
            
            if (courseGrades.averageScore) {
              totalScore += courseGrades.averageScore;
              countWithScores++;
            }
          } catch (err) {
            console.error(`Error fetching grades for course ${course.courseId}:`, err);
            // Fallback to course summary data
            totalCorrect += course.completedExercises || 0;
            totalExercises += course.totalExercises || 0;
          }
        }

        // Calculate totals
        const totalEntregados = totalCorrect + totalIncorrect + totalPending;
        const totalPendientes = totalNotSubmitted;

        setKpis({
          entregados: totalEntregados,
          aprobados: totalCorrect,
          pendientes: totalPendientes,
          promedio: countWithScores > 0 ? (totalScore / countWithScores).toFixed(1) : 0,
        });
      } catch (error) {
        console.error("Error fetching student data:", error);
        // Show error to user but don't block the UI
        setKpis({
          entregados: 0,
          aprobados: 0,
          pendientes: 0,
          promedio: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.grid} style={{gap:20}}>
        <section className={styles.card}>
          <div style={{textAlign: 'center', padding: '40px'}}>
            <div className="spinner" style={{margin: '0 auto 16px'}}></div>
            <p className={styles.meta}>Cargando tus datos...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.grid} style={{gap:20}}>
      <section className={`${styles.hero} ${styles.card}`}>
        <h2>¡Hola, {user?.name || "Estudiante"}! 👋</h2>
        <p className={styles.meta}>Este es tu tablero. Acá verás tu avance y cursos.</p>
      </section>

      <section className={`${styles.grid} ${styles.kpis}`}>
        <div className={styles.card}><div className={styles.meta}>Entregados</div><div className={styles.big}>{kpis.entregados}</div></div>
        <div className={styles.card}><div className={styles.meta}>Aprobados</div><div className={styles.big}>{kpis.aprobados}</div></div>
        <div className={styles.card}><div className={styles.meta}>Pendientes</div><div className={styles.big}>{kpis.pendientes}</div></div>
        <div className={styles.card}><div className={styles.meta}>Promedio</div><div className={styles.big}>{kpis.promedio}</div></div>
      </section>

      <section className={styles.card}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h3>Mis cursos</h3>
          <span className={styles.badge}>{cursos.length} activos</span>
        </div>
        <div className={styles.list} style={{marginTop:12}}>
          {cursos.map(c=>(
            <div key={c.courseId} className={styles.row}>
              <div className={styles.left}>
                <strong>{c.courseName}</strong>
                <span className={styles.meta}>Progreso: {c.completionPercentage?.toFixed(1) || 0}%</span>
              </div>
              <div>
                <a className={`${styles.btn} ${styles.ghost}`} href={`/student/grades/${c.courseId}`}>Ver calificaciones</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
