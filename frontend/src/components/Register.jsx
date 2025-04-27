import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        username,
        email,
        password,
      });
      alert("Registered successfully. Please login.");
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with image */}
      <div className="hidden lg:block w-1/2 bg-gray-100">
        <div 
          className="h-full w-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://cdn.pixabay.com/photo/2023/10/04/14/15/man-8293794_1280.jpg')"
          }}
        ></div>
      </div>

      {/* Right side with registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-600">Create your account</h2>
            <p className="text-gray-500 mt-2">Join our food community today</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="annyghosh3@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="•••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg transition duration-300 shadow-md"
            >
              Register
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <span
              className="text-orange-600 hover:text-orange-500 font-medium cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;