import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiClock, FiActivity, FiAward, FiTarget, FiTrendingUp, FiPlus } from "react-icons/fi";
import { FaRunning } from "react-icons/fa";

const LearningPlans = () => {
  const [learningPlans, setLearningPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearningPlans = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to view learning plans");
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:8080/api/learningplans", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setLearningPlans(data);
      } catch (error) {
        console.error("Error fetching learning plans:", error);
        toast.error("Failed to load learning plans. Please try again later.");
      }
    };

    fetchLearningPlans();
  }, [navigate]);

  const handlePlanClick = (plan) => {
    if (!plan) {
      toast.error("Something went wrong. Plan not found.");
      return;
    }
    if (!plan.id) {
      toast.error("Invalid plan data. Missing ID.");
      return;
    }
    navigate(`/learning-plan/${plan.id}`);
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this learning plan?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to delete learning plans");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/learningplans/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        setLearningPlans(learningPlans.filter((plan) => plan.id !== id));
        toast.success("Learning plan deleted successfully.");
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || "Failed to delete the learning plan. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting learning plan:", error);
      toast.error("An error occurred while deleting. Please try again.");
    }
  };

  const handleCreateNewPlan = () => {
    navigate("/create-learning-plan");
  };

  const handleEditPlan = (id) => {
    navigate(`/edit-learning-plan/${id}`);
  };

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-800">
                Your Coking Journey
              </h2>
              <p className="text-gray-600 mt-2">
                Explore tasty recipes, improve your cooking skills, and make every meal a masterpiece.</p>
            </div>
            <button
              onClick={handleCreateNewPlan}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <FiPlus size={20} />
              Create New Plan
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FiActivity />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Plans</p>
                  <p className="text-xl font-bold text-gray-800">
                    {learningPlans.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <FiAward />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Skills Mastered</p>
                  <p className="text-xl font-bold text-gray-800">
                    {learningPlans.reduce((acc, plan) => acc + plan.skills.split(",").length, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <FiClock />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cooking Hours</p>
                  <p className="text-xl font-bold text-gray-800">12.5</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <FiTrendingUp />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Progress Rate</p>
                  <p className="text-xl font-bold text-gray-800">85%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPlans.map((plan) => (
              <div
                key={plan.id}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden hover:scale-[1.02] border border-gray-100"
              >
                {/* Image with overlay */}
                <div className="relative h-48 overflow-hidden">
                  {plan.mediaType === "IMAGE" && plan.image ? (
                    <img
                      src={plan.image}
                      alt={plan.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "/placeholder-sports.jpg";
                      }}
                    />
                  ) : plan.mediaType === "VIDEO" && plan.video ? (
                    <video
                      src={plan.video}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <FaRunning className="text-white text-4xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white drop-shadow-md">
                    {plan.title}
                  </h3>
                </div>

                {/* Card content */}
                <div className="p-5">
                  {/* Goal description */}
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                    {plan.goal || "No description available"}
                  </p>

                  {/* Skills chips */}
                  <div className="mb-5">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Skills you'll master:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {plan.skills ? (
                        plan.skills
                          .split(", ")
                          .slice(0, 3)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100"
                            >
                              {skill.trim()}
                            </span>
                          ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          No skills specified
                        </span>
                      )}
                      {plan.skills?.split(", ").length > 3 && (
                        <span className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-100">
                          +{plan.skills.split(", ").length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handlePlanClick(plan)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                    >
                      <FiTarget size={14} />
                      View Details
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPlan(plan.id)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LearningPlans;