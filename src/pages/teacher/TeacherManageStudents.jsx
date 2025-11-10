// src/pages/teacher/TeacherManageStudents.jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "../../styles/teacher.module.css";

export default function TeacherManageStudents() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get('courseId');
  
  const [cursos, setCursos] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getTeacherCourses();
        setCursos(data || []);
        
        if (courseId && data.length > 0) {
          const course = data.find(c => c.id === courseId);
          if (course) {
            setSelectedCourse(course);
            await loadStudents(course.id);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setMessage({ type: 'error', text: 'Error al cargar los cursos' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const loadStudents = async (courseIdParam) => {
    try {
      setLoading(true);
      const response = await api.getAllStudents(searchTerm, courseIdParam);
      setStudents(response.students || []);
    } catch (error) {
      console.error("Error loading students:", error);
      setMessage({ type: 'error', text: 'Error al cargar los estudiantes' });
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    setSelectedStudents(new Set());
    setSearchTerm("");
    navigate(`/teacher/manage-students?courseId=${course.id}`);
    await loadStudents(course.id);
  };

  const handleSearch = async () => {
    if (selectedCourse) {
      await loadStudents(selectedCourse.id);
    }
  };

  const handleSelectStudent = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    const notEnrolled = students.filter(s => !s.isEnrolled).map(s => s.id);
    if (notEnrolled.every(id => selectedStudents.has(id))) {
      // Deseleccionar todos
      setSelectedStudents(new Set());
    } else {
      // Seleccionar todos los no inscritos
      setSelectedStudents(new Set(notEnrolled));
    }
  };

  const handleEnroll = async () => {
    if (!selectedCourse || selectedStudents.size === 0) {
      setMessage({ type: 'error', text: 'Seleccione al menos un estudiante' });
      return;
    }

    setIsEnrolling(true);
    setMessage({ type: '', text: '' });

    try {
      await api.enrollStudentsToCourse(selectedCourse.id, Array.from(selectedStudents));
      setMessage({ type: 'success', text: `${selectedStudents.size} estudiante(s) inscrito(s) exitosamente` });
      setSelectedStudents(new Set());
      await loadStudents(selectedCourse.id);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al inscribir estudiantes' });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async (studentId) => {
    if (!selectedCourse) return;
    
    if (!window.confirm('¿Está seguro de que desea desinscribir a este estudiante?')) {
      return;
    }

    try {
      await api.unenrollStudentFromCourse(selectedCourse.id, studentId);
      setMessage({ type: 'success', text: 'Estudiante desinscrito exitosamente' });
      await loadStudents(selectedCourse.id);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al desinscribir estudiante' });
    }
  };

  if (loading && !selectedCourse) {
    return (
      <div className={styles.grid} style={{ gap: 24 }}>
        <section className={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p className={styles.muted}>Cargando...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.grid} style={{ gap: 24 }}>
      <div className={styles.topbar}>
        <div>
          <div className={styles.crumbs}>Profesor / Gestión de Estudiantes</div>
          <h2>Gestionar Estudiantes del Curso</h2>
        </div>
      </div>

      {/* Selector de curso */}
      <section className={styles.card}>
        <h3>Seleccionar Curso</h3>
        {cursos.length === 0 ? (
          <p className={styles.muted}>No hay cursos disponibles. Cree un curso primero.</p>
        ) : (
          <div className={styles.actions} style={{ marginTop: 16, flexWrap: 'wrap' }}>
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

      {/* Gestión de estudiantes */}
      {selectedCourse && (
        <>
          {message.text && (
            <div className={message.type === 'success' ? styles.success : styles.error} style={{ padding: 12, borderRadius: 8 }}>
              {message.text}
            </div>
          )}

          <section className={styles.card}>
            <div className={styles.toolbar}>
              <h3>Buscar y Agregar Estudiantes</h3>
              <div className={styles.search} style={{ flex: 1, maxWidth: 400 }}>
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className={styles.btn} onClick={handleSearch}>Buscar</button>
              </div>
            </div>

            {loading ? (
              <p className={styles.muted} style={{ textAlign: 'center', padding: '40px' }}>Cargando estudiantes...</p>
            ) : (
              <>
                {students.length > 0 && (
                  <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button
                      className={`${styles.btn} ${styles.outline}`}
                      onClick={handleSelectAll}
                    >
                      {students.filter(s => !s.isEnrolled).every(s => selectedStudents.has(s.id)) 
                        ? 'Deseleccionar Todos' 
                        : 'Seleccionar Todos (No Inscritos)'}
                    </button>
                    {selectedStudents.size > 0 && (
                      <>
                        <span className={styles.badge}>{selectedStudents.size} seleccionado(s)</span>
                        <button
                          className={`${styles.btn} ${styles.primary}`}
                          onClick={handleEnroll}
                          disabled={isEnrolling}
                        >
                          {isEnrolling ? 'Inscribiendo...' : `Inscribir ${selectedStudents.size} Estudiante(s)`}
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className={styles.preview}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>
                          <input
                            type="checkbox"
                            checked={students.filter(s => !s.isEnrolled).length > 0 && 
                                    students.filter(s => !s.isEnrolled).every(s => selectedStudents.has(s.id))}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Código</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                            <p className={styles.muted}>
                              {searchTerm ? 'No se encontraron estudiantes con ese criterio' : 'No hay estudiantes en el sistema'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr key={student.id}>
                            <td>
                              {!student.isEnrolled && (
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.has(student.id)}
                                  onChange={() => handleSelectStudent(student.id)}
                                />
                              )}
                            </td>
                            <td><strong>{student.name}</strong></td>
                            <td className={styles.muted}>{student.email}</td>
                            <td className={styles.muted}>{student.code}</td>
                            <td>
                              {student.isEnrolled ? (
                                <span className={`${styles.badge} ${styles.success}`}>Inscrito</span>
                              ) : (
                                <span className={styles.badge}>No inscrito</span>
                              )}
                            </td>
                            <td>
                              {student.isEnrolled ? (
                                <button
                                  className={`${styles.btn} ${styles.danger}`}
                                  onClick={() => handleUnenroll(student.id)}
                                  style={{ fontSize: 12, padding: '4px 8px' }}
                                >
                                  Desinscribir
                                </button>
                              ) : (
                                <button
                                  className={`${styles.btn} ${styles.primary}`}
                                  onClick={() => {
                                    setSelectedStudents(new Set([student.id]));
                                    handleEnroll();
                                  }}
                                  style={{ fontSize: 12, padding: '4px 8px' }}
                                >
                                  Inscribir
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}

      {!selectedCourse && cursos.length > 0 && (
        <section className={styles.card}>
          <p className={styles.muted} style={{ textAlign: 'center', padding: '40px' }}>
            Seleccione un curso para gestionar sus estudiantes
          </p>
        </section>
      )}
    </div>
  );
}

