import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/student.module.css";

export default function StudentLayout() {
  const { user, logout } = useAuth();
  
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <h2 className={styles.brand}>Estudiante</h2>
          <p style={{color: "#64748b", fontSize: 14}}>{user?.name || "Usuario"}</p>
        </div>
        <nav className={styles.menu}>
          <NavLink to="/student" end>Inicio</NavLink>
          <NavLink to="/student/courses">Mis Cursos</NavLink>
          <NavLink to="/student/settings">Configuración</NavLink>
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
