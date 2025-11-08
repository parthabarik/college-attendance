// teacher-auth.js - Add this to teacher login page

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCe0DvO_8prqSxzzr7A8AfiGyOqqj-_DP4",
  authDomain: "attendance-67f62.firebaseapp.com",
  databaseURL: "https://attendance-67f62-default-rtdb.firebaseio.com",
  projectId: "attendance-67f62",
  storageBucket: "attendance-67f62.firebasestorage.app",
  messagingSenderId: "459244634281",
  appId: "1:459244634281:web:e8630366dc5cfe31dca9b8",
  measurementId: "G-RM00FSG6Q9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Teacher login function
export async function teacherLogin(email, password) {
  try {
    const snapshot = await get(ref(db, 'teachers'));
    
    if (snapshot.exists()) {
      const teachers = snapshot.val();
      const teacher = Object.values(teachers).find(t => t.email === email);
      
      if (teacher) {
        // Simple password check (in real app, use proper authentication)
        if (teacher.password === password) {
          return {
            success: true,
            teacher: {
              id: teacher.id,
              name: teacher.name,
              email: teacher.email,
              subject: teacher.subject,
              department: teacher.department
            }
          };
        } else {
          return {
            success: false,
            error: 'Invalid password'
          };
        }
      } else {
        return {
          success: false,
          error: 'Teacher not found'
        };
      }
    } else {
      return {
        success: false,
        error: 'No teachers found in database'
      };
    }
  } catch (error) {
    console.error('Error during teacher login:', error);
    return {
      success: false,
      error: 'Login failed: ' + error.message
    };
  }
}