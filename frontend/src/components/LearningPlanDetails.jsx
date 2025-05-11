import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiTarget, FiCalendar, FiTrendingUp, FiAward } from "react-icons/fi";
import { FaRunning, FaSwimmer, FaBasketballBall, FaFutbol } from "react-icons/fa";

const LearningPlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/api/learningplans/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPlan(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load learning plan");
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this learning plan?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8080/api/learningplans/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        navigate("/learning");
      } catch (err) {
        setError("Failed to delete learning plan");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-red-500 text-xl">{error}</div>
    </div>
  );
  
  if (!plan) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-gray-600 text-xl">Training plan not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-4xl font-bold text-blue-800">{plan.title}</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate(`/learning/update/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FiTarget size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Media Display */}
          {plan.mediaType && (plan.image || plan.video) && (
            <div className="rounded-xl overflow-hidden shadow-lg">
              {plan.mediaType === "IMAGE" && plan.image && (
                <img
                  src={plan.image}
                  alt={plan.title}
                  className="w-full h-96 object-cover"
                />
              )}
              {plan.mediaType === "VIDEO" && plan.video && (
                <video
                  src={plan.video}
                  controls
                  className="w-full h-96 object-cover"
                />
              )}
            </div>
          )}

          {/* Goal Section */}
          <section className="bg-blue-50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <FiTarget size={20} />
              Training Goal
            </h2>
            <p className="text-gray-700">{plan.goal}</p>
          </section>

          {/* Skills Section */}
          <section className="bg-blue-50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <FiAward size={20} />
              Skills to Master
            </h2>
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
          </section>

          {/* Training Steps */}
          <section className="bg-blue-50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-blue-800 mb-6 flex items-center gap-2">
              <FiTrendingUp size={20} />
              Training Steps
            </h2>
            <div className="space-y-6">
              {plan.steps.map((step, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500"
                >
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">
                    Step {index + 1}: {step.topic}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <FiCalendar size={16} />
                        Timeline:
                      </span>
                      <p className="text-gray-600 mt-1">{step.timeline}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Resources:
                      </span>
                      <p className="text-gray-600 mt-1">{step.resources}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end mt-8">
            <button
              onClick={() => navigate("/learning")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              Back to Training Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPlanDetails; 