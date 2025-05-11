import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaLeaf, FaApple, FaFacebook, FaDumbbell, FaRunning } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState(localStorage.getItem("rememberedEmail") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem("rememberedEmail"));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      console.log("Login response:", res.data); // Debug log

      const token = res.data.token;
      const welcomeMsg = res.data.message || "";
      const usernameMatch = welcomeMsg.match(/Welcome back,\s*(.+)!/);
      const fullName = usernameMatch ? usernameMatch[1] : "User";
      const firstName = fullName.split(" ")[0];
      const userId = res.data.userId;

      console.log("Setting localStorage with:", { token, fullName, firstName, userId }); // Debug log

      localStorage.setItem("token", token);
      localStorage.setItem("userName", firstName);
      localStorage.setItem("username", fullName);
      localStorage.setItem("userId", userId);
      
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Verify localStorage was set correctly
      console.log("Verifying localStorage:", {
        token: localStorage.getItem("token"),
        username: localStorage.getItem("username"),
        userId: localStorage.getItem("userId")
      });

      toast.success(`Welcome back, ${firstName}!`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Login error:", err.response?.data || err); // Debug log
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.", {
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      const token = credentialResponse.credential;
      const decoded = jwtDecode(token);

      const res = await axios.post("http://localhost:8080/api/auth/google", {
        token,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.data?.token) {
        throw new Error('No token received from server');
      }

      const jwt = res.data.token;
      const fullName = decoded.name || "User";
      const firstName = fullName.split(" ")[0];
      const userId = res.data.userId;

      localStorage.setItem("token", jwt);
      localStorage.setItem("userName", firstName);
      localStorage.setItem("username", fullName);
      localStorage.setItem("photoURL", decoded.picture || "");
      localStorage.setItem("email", decoded.email || "");
      localStorage.setItem("userId", userId);

      toast.success(`Welcome, ${firstName}!`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Google login failed:", err);
      toast.error(`Google login failed: ${err.message}`, {
        position: "top-center",
      });
      ['token', 'userName', 'username', 'photoURL', 'email', 'userId'].forEach(key => {
        localStorage.removeItem(key);
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100">
      <ToastContainer />
      
      {/* Left side with decorative elements */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden">
        <motion.div 
          className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-gradient-to-r from-indigo-200 to-blue-200 opacity-50"
          animate={{
            x: [-50, 50, -50],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 opacity-50"
          animate={{
            x: [50, -50, 50],
            y: [50, -50, 50],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div 
          className="relative z-10 p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <FaDumbbell className="mx-auto text-6xl text-indigo-600 mb-2" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Skill Sport</h2>
          <p className="text-lg text-gray-600 max-w-md">
            Connect with athletes. Share skills. Elevate your game.
          </p>
        </motion.div>
      </div>

      {/* Right side with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div 
          className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Form header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
            <motion.h2 
              className="text-3xl font-bold text-white"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Sign In
            </motion.h2>
            <motion.p 
              className="text-amber-100 mt-2"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Access your recipes and community
            </motion.p>
          </div>
          
          {/* Form content */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email field */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </motion.div>
              
              {/* Password field */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 focus:outline-none"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-blue-600 focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Remember me & forgot password */}
              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
                </div>
              </motion.div>
              
              {/* Submit button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Sign in'}
                </button>
              </motion.div>
            </form>
            
            {/* Divider */}
            <motion.div 
              className="mt-6 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </motion.div>
            
            {/* Social login buttons */}
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast.error('Google login failed. Please try again.');
                }}
                useOneTap
                theme="outline"
                shape="pill"
                size="medium"
                text="continue_with"
                ux_mode="popup"
                auto_select
                width="100%"
              />
            </motion.div>
            
            {/* Sign up link */}
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={() => navigate("/register")}
                  className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                >
                  Sign up
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;