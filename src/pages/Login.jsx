// src/pages/Login.jsx
import LoginForm from "../components/LoginForm";
import styles from "../styles/register.module.css"; // Usamos los estilos de registro para mantener la estética

export default function Login() {
  return (
    <div className={styles.container}>
      {/* Columna izquierda: imagen + overlay + texto */}
      <aside className={styles.hero}>
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <h1>Bienvenido de nuevo</h1>
          <p>
            Ingrese sus datos para acceder a la plataforma de calificación.
          </p>
        </div>
      </aside>

      {/* Columna derecha: formulario de login */}
      <section className={styles.formSection}>
        <div className={styles.formCard}>
          <img src="/logo.jpg" alt="Logo" className={styles.logo} />
          <LoginForm />
        </div>
      </section>
    </div>
  );
}
