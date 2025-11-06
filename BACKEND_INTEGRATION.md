# Backend Integration Guide

This document explains how the frontend is connected to the backend.

## Overview

The frontend is now fully connected to your backend API. Here's what has been implemented:

## 1. API Configuration

The API base URL is configured in `src/services/api.js`:
- Base URL: `http://localhost:8080/api`
- All API calls are centralized in the `api.js` service file

## 2. Authentication

### Login (`POST /api/auth/login`)
- Located in: `src/components/LoginForm.jsx`
- When user logs in, the token is stored in `localStorage`
- User data is stored in `localStorage`
- Automatic redirect based on user role (TEACHER → `/teacher`, STUDENT → `/student`)

### Register (`POST /api/auth/register`)
- Located in: `src/components/RegisterForm.jsx`
- Maps frontend form fields to backend format:
  - `nombres + apellidos` → `name`
  - `rol` → `role` (TEACHER or STUDENT)
  - `codigo` → `code`

## 3. Protected Routes

### Teacher Routes (`/teacher/*`)
- Protected by `requiredRole="TEACHER"`
- All routes require authentication
- Access to:
  - Dashboard
  - Courses
  - Upload CSV
  - Statistics
  - Settings

### Student Routes (`/student/*`)
- Protected by `requiredRole="STUDENT"`
- All routes require authentication
- Access to:
  - Dashboard
  - Courses
  - Grades
  - Settings

## 4. Teacher Features

### Upload CSV (`POST /api/teacher/upload-csv`)
- Located in: `src/pages/teacher/TeacherUpload.jsx`
- Upload form includes:
  - Course Code
  - Course Name
  - Description (optional)
  - CSV file (multipart/form-data)
- Shows preview before upload
- Success message after upload

### Get Courses (`GET /api/teacher/courses`)
- Located in: `src/pages/teacher/TeacherDashboard.jsx`, `TeacherCourses.jsx`
- Displays all teacher's courses with statistics

## 5. Student Features

### Get Courses (`GET /api/student/courses`)
- Located in: `src/pages/student/StudentDashboard.jsx`, `StudentCourses.jsx`
- Shows enrolled courses with:
  - Course name
  - Progress percentage
  - Average score
  - Total exercises

### Get Grades (`GET /api/student/courses/{courseId}/grades`)
- Located in: `src/pages/student/StudentGrades.jsx`
- Shows exercise grades for a specific course
- Displays:
  - Exercise name
  - Score
  - Status (CORRECT, INCORRECT, PENDING, NOT_SUBMITTED)
  - Submission date

## 6. Authentication Context

Located in: `src/context/AuthContext.jsx`
- Provides authentication state throughout the app
- Stores token in `localStorage`
- Provides:
  - `user`: Current user object
  - `login(email, password)`: Login function
  - `register(userData)`: Register function
  - `logout()`: Logout function
  - `isAuthenticated`: Boolean flag
  - `loading`: Loading state

## 7. Protected Route Component

Located in: `src/components/ProtectedRoute.jsx`
- Verifies user is authenticated
- Checks role permission if required
- Redirects to login if not authenticated

## 8. Logout Feature

Both teacher and student layouts now include a logout button in the sidebar. When clicked:
- Token is removed from `localStorage`
- User data is cleared
- User is redirected to `/login`

## 9. Error Handling

All API calls include error handling:
- Network errors are caught and displayed to user
- Invalid credentials show error message
- Loading states prevent duplicate submissions

## 10. Backend URL

The backend URL is configured in:
- File: `frontend/src/services/api.js`
- Constant: `API_BASE_URL`
- Current value: `http://localhost:8080/api`

To change the backend URL, modify the `API_BASE_URL` constant in `src/services/api.js`.

## Testing the Integration

1. Start your backend server on `http://localhost:8080`
2. Run the frontend: `npm run dev`
3. Open the app in browser
4. Try:
   - Register a new teacher or student
   - Login with credentials
   - Upload a CSV file (as teacher)
   - View courses and grades

## CSV Upload Format

The CSV should have:
- First column: "Student Name"
- Remaining columns: Exercise names (e.g., "Ejercicio 1", "Ejercicio 2")
- Values: "100", "80", "Not Submitted", etc.

Example:
```
Student Name,Ejercicio 1,Ejercicio 2,Ejercicio 3
Ana Estudiante,100,80,Not Submitted
Juan Pérez,90,Not Submitted,100
María García,85,95,90
```

## Notes

- JWT token is stored in `localStorage` as `token`
- User data is stored in `localStorage` as `user`
- All authenticated requests include the token in the `Authorization: Bearer {token}` header
- Unauthenticated users are redirected to `/login`
- Protected routes check for authentication and role permissions

