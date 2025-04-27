import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [sportCommunities, setSportCommunities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: "", description: "" });

  // Sample data for athletes to connect with
  const athletesToConnect = [
    { id: 1, name: "Alex Johnson", sport: "🏀 Basketball", skills: "Shooting, Defense" },
    { id: 2, name: "Maria Garcia", sport: "⚽ Soccer", skills: "Dribbling, Passing" },
    { id: 3, name: "James Wilson", sport: "🎾 Tennis", skills: "Serve, Volley" },
    { id: 4, name: "Sarah Lee", sport: "🏊 Swimming", skills: "Freestyle, Butterfly" },
  ];

  // Sample training sessions
  const trainingSessions = [
    {
      id: 1,
      title: "Basketball Shooting Clinic 🏀",
      description: "Improve your shooting accuracy with professional techniques. Perfect for all skill levels!",
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      author: "Pro Hoops Academy",
      date: "Tomorrow, 4:00 PM",
      location: "Downtown Sports Complex"
    },
    {
      id: 2,
      title: "Soccer Skills Workshop ⚽",
      description: "Master ball control and precision passing with our expert coaches.",
      imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      author: "Elite Football Club",
      date: "Saturday, 10:00 AM",
      location: "Central Park Field"
    },
  ];

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "Athlete");

    const fetchCommunities = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/communities");
        setSportCommunities(response.data);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunities();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/communities", newCommunity);
      setSportCommunities([...sportCommunities, response.data]);
      setNewCommunity({ name: "", description: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating community:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-blue-800 mb-2">
              Welcome back, <span className="text-orange-600">{username}</span>!
            </h1>
            <p className="text-lg text-gray-600">
              Find your next cooking partner or join a skills
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Athletes to Connect */}
            <div className="lg:w-1/4 w-full">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <span className="mr-2">🤝</span> Connect With Athletes
                </h2>
                <ul className="space-y-4">
                  {athletesToConnect.map((athlete) => (
                    <li key={athlete.id} className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center mr-3 font-bold">
                          {athlete.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900">{athlete.name}</h3>
                          <p className="text-sm text-blue-700">{athlete.sport}</p>
                          <p className="text-xs text-gray-500 mt-1">{athlete.skills}</p>
                        </div>
                      </div>
                      <button className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-1 px-4 rounded-lg text-sm hover:from-blue-700 hover:to-blue-600 transition">
                        Connect
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Center Column: Training Sessions */}
            <div className="lg:w-2/4 w-full">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                  <span className="mr-2">🏆</span> Upcoming cooking Sessions
                </h2>
                <div className="space-y-6">
                  {trainingSessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                      <img
                        src={session.imageUrl}
                        alt={session.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-blue-900">{session.title}</h3>
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            {session.sport}
                          </span>
                        </div>
                        <p className="text-gray-600 my-3">{session.description}</p>
                        <div className="text-sm text-gray-500 mb-4">
                          <p>📅 {session.date}</p>
                          <p>📍 {session.location}</p>
                          <p>👤 Hosted by {session.author}</p>
                        </div>
                        <div className="flex gap-3">
                          <button className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400 text-white py-2 rounded-lg hover:from-orange-600 hover:to-orange-500 transition">
                            Join Session
                          </button>
                          <button className="flex-1 border border-orange-500 text-orange-600 py-2 rounded-lg hover:bg-orange-50 transition">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Sport Communities */}
            <div className="lg:w-1/4 w-full">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-800 flex items-center">
                    <span className="mr-2">👥</span> Communities
                  </h2>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm px-3 py-1 rounded-lg hover:from-blue-700 hover:to-blue-600 transition"
                  >
                    {showForm ? 'Cancel' : '+ Create'}
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={handleFormSubmit} className="mb-6 bg-blue-50 p-4 rounded-lg">
                    <input
                      type="text"
                      placeholder="Community Name"
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                      className="w-full border border-gray-300 p-2 rounded mb-2"
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                      className="w-full border border-gray-300 p-2 rounded mb-3"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white py-2 rounded-lg hover:from-orange-600 hover:to-orange-500 transition"
                    >
                      Create Community
                    </button>
                  </form>
                )}

                <div className="space-y-4">
                  {sportCommunities.map((community) => (
                    <div key={community.id} className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50 transition">
                      <h3 className="font-semibold text-blue-900">{community.name}</h3>
                      <p className="text-sm text-gray-600 my-2">{community.description}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-blue-600">42 members</span>
                        <button 
                          onClick={() => navigate(`/community/${community.id}`)}
                          className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;