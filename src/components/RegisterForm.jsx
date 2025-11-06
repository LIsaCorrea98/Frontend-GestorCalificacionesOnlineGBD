// src/components/RegisterForm.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/register.module.css";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const STUDENT_CODE_RE = /^\d{7}$/;        // 7 dígitos exactos
const TEACHER_CODE_RE = /^[a-zA-Z0-9]{5,}$/; // alfanumérico 5+ chars

export default function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    codigo: "",
    rol: "", // "estudiante" | "docente"
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};

    // nombres y apellidos
    if (!formData.nombres.trim()) e.nombres = "Los nombres son obligatorios";
    if (!formData.apellidos.trim()) e.apellidos = "Los apellidos son obligatorios";

    // email
    if (!EMAIL_RE.test(formData.email)) e.email = "Correo inválido";

    // password
    if (formData.password.length < 6) e.password = "Mínimo 6 caracteres";

    // rol
    if (!formData.rol) e.rol = "Seleccione un rol";

    // código (dependiente del rol)
    if (!formData.codigo.trim()) {
      e.codigo = "El código es obligatorio";
    } else if (formData.rol === "estudiante" && !STUDENT_CODE_RE.test(formData.codigo)) {
      e.codigo = "El código de estudiante debe tener 7 dígitos (ej: 1152265)";
    } else if (formData.rol === "docente" && !TEACHER_CODE_RE.test(formData.codigo)) {
      e.codigo = "Código de docente: alfanumérico de 5+ caracteres";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setErrors({}); // Clear previous errors
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(formData);
      if (onSuccess) onSuccess();
    } catch (error) {
      setErrors({ submit: error.message || "Error al registrar. Intente nuevamente." });
    } finally {
      setIsLoading(false);
    }
  };

  const isStudent = formData.rol === "estudiante";

  return (
    <form onSubmit={onSubmit} className={styles.formGrid} noValidate>
      {errors.submit && <div className={styles.error}>{errors.submit}</div>}
      
      {isStudent && (
        <div className={styles.notice}>
          <strong>Estimado/a estudiante:</strong> escriba correctamente sus datos.
          Estos se reflejarán en su calificación y reportes.
        </div>
      )}

      <div className={styles.field}>
        <input
          name="nombres"
          placeholder="Nombres"
          value={formData.nombres}
          onChange={onChange}
          aria-invalid={!!errors.nombres}
        />
        {errors.nombres && <span className={styles.error}>{errors.nombres}</span>}
      </div>

      <div className={styles.field}>
        <input
          name="apellidos"
          placeholder="Apellidos"
          value={formData.apellidos}
          onChange={onChange}
          aria-invalid={!!errors.apellidos}
        />
        {errors.apellidos && <span className={styles.error}>{errors.apellidos}</span>}
      </div>

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

      <div className={styles.field}>
        <select name="rol" value={formData.rol} onChange={onChange} aria-invalid={!!errors.rol}>
          <option value="">Seleccione su rol</option>
          <option value="docente">Docente</option>
          <option value="estudiante">Estudiante</option>
        </select>
        {errors.rol && <span className={styles.error}>{errors.rol}</span>}
      </div>

      <div className={styles.field}>
        <input
          name="codigo"
          placeholder={isStudent ? "Código (7 dígitos)" : "Código institucional"}
          value={formData.codigo}
          onChange={onChange}
          aria-invalid={!!errors.codigo}
          inputMode={isStudent ? "numeric" : "text"}
        />
        {errors.codigo && <span className={styles.error}>{errors.codigo}</span>}
      </div>

      <button className={styles.primaryBtn} disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
}
