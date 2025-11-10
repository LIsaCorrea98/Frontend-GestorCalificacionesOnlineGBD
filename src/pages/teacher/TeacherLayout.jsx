// src/pages/teacher/TeacherLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/teacher.module.css";

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <h2 className={styles.brand}>Profesor</h2>
          <p style={{color: "#cbd5e1", fontSize: 14, marginBottom: 8}}>{user?.name || "Usuario"}</p>
        </div>
        <nav className={styles.menu}>
          <NavLink to="/teacher" end>🏠 Inicio / Dashboard</NavLink>
          <NavLink to="/teacher/courses">📚 Mis Cursos</NavLink>
          <NavLink to="/teacher/upload">📤 Subir Calificaciones (CSV)</NavLink>
          <NavLink to="/teacher/manage-students">👥 Gestionar Estudiantes</NavLink>
          <NavLink to="/teacher/stats">📊 Estadísticas</NavLink>
          <NavLink to="/teacher/logs">📋 Bitácora de Entregas</NavLink>
          <NavLink to="/teacher/settings">⚙️ Configuración</NavLink>
        </nav>
        <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button 
            onClick={logout}
            className={styles.logoutBtn}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
