// ...existing code...
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import TeacherLayout from "./pages/teacher/TeacherLayout.jsx";
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import TeacherCourses from "./pages/teacher/TeacherCourses.jsx";
import TeacherUpload from "./pages/teacher/TeacherUpload.jsx";
import TeacherStats from "./pages/teacher/TeacherStats.jsx";
import TeacherLogs from "./pages/teacher/TeacherLogs.jsx";
import TeacherSettings from "./pages/teacher/TeacherSettings.jsx";
import TeacherManageStudents from "./pages/teacher/TeacherManageStudents.jsx";

import StudentLayout from "./pages/student/StudentLayout.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentCourses from "./pages/student/StudentCourses.jsx";
import StudentGrades from "./pages/student/StudentGrades.jsx";
import StudentExerciseDetail from "./pages/student/StudentExerciseDetail.jsx";
// ...existing code...

export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas para docentes (protegidas) */}
      <Route 
        path="/teacher" 
        element={
          <ProtectedRoute requiredRole="TEACHER">
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="courses" element={<TeacherCourses />} />
        <Route path="upload" element={<TeacherUpload />} />
        <Route path="manage-students" element={<TeacherManageStudents />} />
        <Route path="stats" element={<TeacherStats />} />
        <Route path="logs" element={<TeacherLogs />} />
        <Route path="settings" element={<TeacherSettings />} />
      </Route>

      {/* Rutas para estudiantes (protegidas) */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="grades/:courseId" element={<StudentGrades />} />
        <Route path="exercise/:exerciseId" element={<StudentExerciseDetail />} />
        <Route path="settings" element={<div>Configuración (pronto)</div>} />
      </Route>

      {/* Ruta catch-all al final */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
// ...existing code...