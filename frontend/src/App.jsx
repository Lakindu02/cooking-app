// App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import {
  auth,
  provider,
  signInWithPopup,
  signOut,
} from "./firebase"; // You'll create this file
import { onAuthStateChanged } from "firebase/auth";

import "./index.css";

function App() {
  const [user, setUser] = useState(null);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleLogin = () => {
    signInWithPopup(auth, provider).catch((error) =>
      console.error("Login error:", error)
    );
  };

  const handleLogout = () => {
    signOut(auth).catch((error) =>
      console.error("Logout error:", error)
    );
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
