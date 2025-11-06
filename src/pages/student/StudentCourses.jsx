// src/pages/student/StudentCourses.jsx
import { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "../../styles/student.module.css";

export default function StudentCourses() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getStudentCourses();
        setCursos(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className={styles.card}>Cargando...</div>;
  }

  return (
    <section className={styles.card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3>Mis cursos</h3>
        <span className={styles.badge}>{cursos.length} activos</span>
      </div>

      <div className={styles.list} style={{ marginTop: 12 }}>
        {cursos.length === 0 ? (
          <p className={styles.meta}>No estás inscrito en ningún curso todavía.</p>
        ) : (
          cursos.map((c) => (
            <div key={c.courseId} className={styles.row}>
              <div className={styles.left}>
                <strong>{c.courseName}</strong>
                <span className={styles.meta}>Progreso: {c.completionPercentage?.toFixed(1) || 0}%</span>
              </div>
              <div>
                <a className={`${styles.btn} ${styles.ghost}`} href={`/student/grades/${c.courseId}`}>
                  Ver calificaciones
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
