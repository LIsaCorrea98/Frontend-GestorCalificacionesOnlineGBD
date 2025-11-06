import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/login.module.css"; // Usamos el CSS de login

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/; // Validación básica de correo
const PASSWORD_MIN_LENGTH = 6; // Mínimo 6 caracteres para la contraseña

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState(""); // Error de login (correo o contraseña incorrectos)
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    // Validación de email
    if (!EMAIL_RE.test(formData.email)) e.email = "Correo inválido";

    // Validación de contraseña
    if (formData.password.length < PASSWORD_MIN_LENGTH)
      e.password = "La contraseña debe tener al menos 6 caracteres";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();

    // Limpiar cualquier error previo de login
    setLoginError("");

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      
      // Redirect based on role
      if (response.user.role === 'TEACHER') {
        navigate('/teacher');
      } else if (response.user.role === 'STUDENT') {
        navigate('/student');
      }
    } catch (error) {
      setLoginError(error.message || "Correo o contraseña incorrectos. ¿No tienes cuenta?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={styles.formGrid} noValidate>
      {loginError && <div className={styles.error}>{loginError}</div>}

      <div className={styles.field}>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={onChange}
          aria-invalid={!!errors.email}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={onChange}
          aria-invalid={!!errors.password}
        />
        {errors.password && <span className={styles.error}>{errors.password}</span>}
      </div>

      <button className={styles.primaryBtn} disabled={isLoading}>
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>

      <div className={styles.field}>
        <p>
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>
    </form>
  );
}
