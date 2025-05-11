// src/components/LearningPlanDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiTarget, FiCalendar, FiTrendingUp, FiAward } from "react-icons/fi";
import { FaRunning, FaSwimmer, FaBasketballBall, FaFutbol } from "react-icons/fa";

const LearningPlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State to hold the learning plan data
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the learning plan details based on the ID
  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to view learning plan details");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/api/learningplans/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setPlan(response.data);
      } catch (err) {
        if (err.response?.status === 403) {
          toast.error("You don't have permission to view this learning plan");
        } else {
          setError("Failed to fetch the plan details.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlanDetails();
    }
  }, [id, navigate]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  // If plan not found
  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Training plan not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-blue-800 mb-4">{plan.title}</h2>
        <p className="text-gray-700 mb-6">{plan.goal}</p>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <FiAward size={20} />
            Skills to Master
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.skills.split(", ").map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center mb-6">
          {plan.image && (
            <img
              src={plan.image}
              alt={plan.title}
              className="w-full max-w-[600px] rounded-lg shadow-lg"
            />
          )}
        </div>

        <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <FiTrendingUp size={20} />
          Training Steps
        </h3>

        <div className="space-y-6">
          {plan.steps.map((step, index) => (
            <div
              key={index}
              className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500 shadow"
            >
              <h4 className="text-xl font-semibold text-blue-800 mb-3">
                Step {index + 1}: {step.topic}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FiCalendar size={16} className="text-blue-600" />
                  <span className="font-medium text-gray-700">Timeline:</span>
                  <span className="text-gray-600">{step.timeline}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Resources:</span>
                  <p className="text-gray-600 mt-1">{step.resources}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={() => navigate("/learning")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FiTarget size={16} />
            Back to Training Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningPlanDetails;