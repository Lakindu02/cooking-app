import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      const token = res.data.token;
      const welcomeMsg = res.data.message || "";
      const usernameMatch = welcomeMsg.match(/Welcome back,\s*(.+)!/);
      const username = usernameMatch ? usernameMatch[1] : "User";

      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      }
      navigate("/");
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
        const token = credentialResponse.credential;
        const decoded = jwtDecode(token);

        // Debug: Check what Google returns
        console.log('Google Auth Response:', decoded);

        const res = await axios.post("http://localhost:8080/api/auth/google", {
            token,
        });

        const jwt = res.data.token;
        
        // Use Google's name if available, otherwise fallback to your API response
        const googleName = decoded.name || "User";
        const username = googleName.split(' ')[0]; // Get first name only
        
        // Store all relevant user data
        localStorage.setItem("token", jwt);
        localStorage.setItem("username", googleName); // Full name
        localStorage.setItem("firstName", username); // First name only
        localStorage.setItem("photoURL", decoded.picture || ''); // Handle empty picture case
        localStorage.setItem("email", decoded.email || '');

        // Debug: Verify stored data
        console.log('Stored user data:', {
            name: googleName,
            photo: decoded.picture,
            email: decoded.email
        });

        navigate("/");
    } catch (err) {
        console.error("Google login failed:", err);
        alert("Google login failed. Please try again.");
        
        // Optional: Clear any partial auth data
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("photoURL");
    }
};
  return (
    <div className="min-h-screen flex bg-gradient-to-r from-indigo-50 to-orange-50">
      {/* Left side with animated food image */}
      <motion.div 
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-100 to-amber-100 items-center justify-center p-12"
      >
        <motion.div
          className="w-full h-full bg-contain bg-no-repeat bg-center"
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg')"
          }}
        />
      </motion.div>

      {/* Right side with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          className="max-w-md w-full space-y-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <motion.h2 
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              Welcome back!
            </motion.h2>
            <p className="text-gray-600 mt-2">Let's get you logged in</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div 
              className="space-y-1"
              whileHover={{ scale: 1.01 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaEnvelope className="mr-2 text-orange-500" />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </motion.div>
            
            <motion.div 
              className="space-y-1"
              whileHover={{ scale: 1.01 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaLock className="mr-2 text-orange-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="•••••••"
                />
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                <button 
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-orange-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </motion.div>

            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center"
                whileTap={{ scale: 0.95 }}
              >
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </motion.div>
              <motion.div 
                className="text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                  Forgot Password?
                </a>
              </motion.div>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-3 rounded-lg shadow-lg"
              whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(249, 115, 22, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google login failed")}
                useOneTap
                theme="filled_blue"
                shape="pill"
                size="large"
                text="continue_with"
              />
            </motion.div>
          </div>

          <motion.p 
            className="text-center text-sm text-gray-600"
            whileHover={{ scale: 1.01 }}
          >
            Don't have an account?{" "}
            <span
              className="text-orange-600 hover:text-orange-500 font-medium cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Sign up
            </span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;