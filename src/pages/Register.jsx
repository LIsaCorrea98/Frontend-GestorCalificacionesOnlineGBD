// src/pages/Register.jsx
import RegisterForm from "../components/RegisterForm";
import styles from "../styles/register.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [isRegistered, setIsRegistered] = useState(false);

  // Al registrar, cambiamos el estado a "registrado"
  const handleRegistrationSuccess = () => {
    setIsRegistered(true);
  };

  return (
    <div className={styles.container}>
      {/* Si el usuario ya se registró, muestra mensaje de éxito */}
      {isRegistered ? (
        <section className={styles.formSection}>
          <div className={styles.formCard}>
            <h2>¡Registro exitoso!</h2>
            <p>¡Tu cuenta ha sido creada exitosamente!</p>
            <Link to="/login">
              <button className={styles.primaryBtn}>Volver al Login</button>
            </Link>
          </div>
        </section>
      ) : (
        // Si no está registrado, muestra el formulario
        <>
          <aside className={styles.hero}>
            <div className={styles.overlay} />
            <div className={styles.heroContent}>
              <h1>Bienvenido a la Plataforma de Calificación</h1>
              <p>
                Aquí podrá registrarse para acceder a la calificación de sus ejercicios realizados en la plataforma OnlineGBD.
              </p>
            </div>
          </aside>

          <section className={styles.formSection}>
            <div className={styles.formCard}>
              <img src="/logo.jpg" alt="Logo" className={styles.logo} />
              <RegisterForm onSuccess={handleRegistrationSuccess} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
