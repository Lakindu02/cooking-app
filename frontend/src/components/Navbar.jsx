// components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  // State for user data
  const [userData, setUserData] = useState({
    username: '',
    photoURL: '',
    firstName: ''
  });

  // State for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      const username = localStorage.getItem("username") || '';
      const photoURL = localStorage.getItem("photoURL") || '';
      const firstName = localStorage.getItem("firstName") || username.split(' ')[0] || '';

      setUserData({
        username,
        photoURL,
        firstName
      });
    };

    loadUserData();
    window.addEventListener('storage', loadUserData); // Listen for changes

    return () => {
      window.removeEventListener('storage', loadUserData);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("firstName");
    localStorage.removeItem("photoURL");
    localStorage.removeItem("email");
    window.location.href = "/";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-[#F97316]">
              SkillSport <span role="img" aria-label="weight-lifter">🏋️</span>
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-[#F97316] font-medium">Home</Link>
            <Link to="/explore" className="text-gray-600 hover:text-[#F97316] font-medium">Explore</Link>
            <Link to="/profile" className="text-gray-600 hover:text-[#F97316] font-medium">Profile</Link>
            <Link to="/learning" className="text-gray-600 hover:text-[#F97316] font-medium">LearningPlans</Link>
          </div>

          <div className="flex items-center space-x-4">
            {userData.username ? (
              <div className="relative dropdown-container">
                <div className="flex items-center space-x-2">
                  <span className="hidden md:block text-gray-700 font-medium">
                    {userData.firstName} <span role="img" aria-label="wave"></span>
                  </span>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="focus:outline-none"
                  >
                    {userData.photoURL ? (
                      <>
                        <img
                          src={userData.photoURL}
                          alt={userData.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#F97316] cursor-pointer"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden bg-[#F97316] text-white w-10 h-10 rounded-full items-center justify-center font-bold cursor-pointer">
                          {userData.firstName.charAt(0).toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="bg-[#F97316] text-white w-10 h-10 flex items-center justify-center rounded-full font-bold cursor-pointer">
                        {userData.firstName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/posts"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Posts
                    </Link>
                    <Link
                      to="/notifications"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Notifications
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <span className="hidden md:block text-gray-700 font-medium">
                  Guest <span role="img" aria-label="wave"></span>
                </span>
                <div className="bg-[#F97316] text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
                  ?
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;