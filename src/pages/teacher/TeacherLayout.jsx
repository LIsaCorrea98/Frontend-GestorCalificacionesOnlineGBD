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
          <p style={{color: "#64748b", fontSize: 14}}>{user?.name || "Usuario"}</p>
        </div>
        <nav className={styles.menu}>
          <NavLink to="/teacher" end>🏠 Inicio / Dashboard</NavLink>
          <NavLink to="/teacher/courses">📚 Mis Cursos</NavLink>
          <NavLink to="/teacher/upload">📤 Subir Calificaciones (CSV)</NavLink>
          <NavLink to="/teacher/stats">📊 Estadísticas</NavLink>
          <NavLink to="/teacher/logs">📋 Bitácora de Entregas</NavLink>
          <NavLink to="/teacher/settings">⚙️ Configuración</NavLink>
        </nav>
        <button 
          onClick={logout}
          style={{
            marginTop: "auto",
            padding: "10px",
            background: "#fee2e2",
            color: "#991b1b",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Cerrar Sesión
        </button>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
