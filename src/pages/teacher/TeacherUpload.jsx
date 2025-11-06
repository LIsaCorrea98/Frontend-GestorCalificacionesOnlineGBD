// src/pages/teacher/TeacherUpload.jsx
import { useState } from "react";
import api from "../../services/api";
import styles from "../../styles/teacher.module.css";

// Primera columna debe ser "Student Name" (con variaciones posibles)
const REQUIRED_COLS = ["Student Name", "studentname", "student name", "Student name"];

export default function TeacherUpload() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Form data for course info
  const [courseData, setCourseData] = useState({
    courseCode: "",
    courseName: "",
    description: ""
  });

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return { headers: [], rows: [] };
    const hdrs = lines[0].split(",").map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const cols = line.split(",");
      const obj = {};
      hdrs.forEach((h,i)=> obj[h.trim()] = (cols[i] ?? "").trim());
      return obj;
    });
    return { headers: hdrs, rows: data };
  };

  const onFile = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Formato inválido. Cargue un archivo .csv");
      return;
    }
    
    setFile(selectedFile);
    setUploadSuccess(false);
    setError("");
    
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const { headers: hdrs, rows: data } = parseCSV(text);

      // Validación de columnas requeridas (case-insensitive)
      const hasStudentName = hdrs.some(h => 
        REQUIRED_COLS.some(req => h.trim().toLowerCase() === req.toLowerCase())
      );
      if (!hasStudentName) {
        setError(`Falta la columna requerida: "Student Name" (primera columna del CSV)`);
        setRows([]); 
        setHeaders([]);
        return;
      }
      setError("");
      setHeaders(hdrs);
      setRows(data);
    };
    reader.readAsText(selectedFile, "utf-8");
  };

  const onProcess = async () => {
    if (!file) { 
      setError("Seleccione un archivo CSV primero"); 
      return; 
    }
    if (!courseData.courseCode || !courseData.courseName) {
      setError("Complete el código y nombre del curso");
      return;
    }
    
    setIsUploading(true);
    setError("");
    
    try {
      const response = await api.uploadCSV(
        file, 
        courseData.courseCode,
        courseData.courseName,
        courseData.description
      );
      
      console.log("Upload successful:", response);
      
      if (response.success) {
        setUploadSuccess(true);
        setError("");
        setFile(null);
        setRows([]);
        setHeaders([]);
        setCourseData({ courseCode: "", courseName: "", description: "" });
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        // Opcional: redirigir al curso creado
        if (response.courseId) {
          setTimeout(() => {
            window.location.href = `/teacher/courses?courseId=${response.courseId}`;
          }, 2000);
        }
      } else {
        setError(response.message || "Error al procesar el archivo CSV");
        setUploadSuccess(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Error al subir el archivo CSV. Verifique que el formato sea correcto.");
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className={styles.card}>
      <h3>Subir Calificaciones (CSV)</h3>
      <div className={styles.upload}>
        <div style={{marginBottom: 12, display: "grid", gap: 8}}>
          <input
            type="text"
            placeholder="Código del curso (ej: PROG101)"
            value={courseData.courseCode}
            onChange={(e) => setCourseData({...courseData, courseCode: e.target.value})}
            style={{padding: 8, border: "1px solid #e5e7eb", borderRadius: 8}}
          />
          <input
            type="text"
            placeholder="Nombre del curso (ej: Programación I)"
            value={courseData.courseName}
            onChange={(e) => setCourseData({...courseData, courseName: e.target.value})}
            style={{padding: 8, border: "1px solid #e5e7eb", borderRadius: 8}}
          />
          <input
            type="text"
            placeholder="Descripción del curso (opcional)"
            value={courseData.description}
            onChange={(e) => setCourseData({...courseData, description: e.target.value})}
            style={{padding: 8, border: "1px solid #e5e7eb", borderRadius: 8}}
          />
        </div>
        
        <input type="file" accept=".csv" onChange={onFile} />
        {error && (
          <div className="error-message" style={{marginTop: 12}}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {uploadSuccess && (
          <div className="success-message" style={{marginTop: 12}}>
            ✓ Archivo CSV cargado y procesado exitosamente. Las calificaciones han sido registradas.
          </div>
        )}
        {rows.length > 0 && (
          <>
            <div className={styles.actions}>
              <span className={styles.badge}>{rows.length} filas</span>
              <button 
                className={`${styles.btn} ${styles.primary}`} 
                onClick={onProcess}
                disabled={isUploading}
              >
                {isUploading ? 'Subiendo...' : 'Subir CSV'}
              </button>
            </div>
            <div className={`${styles.preview} ${styles.card}`} style={{marginTop:8}}>
              <table className={styles.table}>
                <thead>
                  <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.slice(0,20).map((r,idx)=>(
                    <tr key={idx}>
                      {headers.map(h => <td key={h}>{r[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              <small>Mostrando 20 primeras filas (preview)</small>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
