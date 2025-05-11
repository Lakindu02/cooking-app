import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiPlus, FiTarget, FiCalendar, FiTrendingUp } from "react-icons/fi";

const CreatePlanDetails = () => {
  const navigate = useNavigate();
  const [learningPlan, setLearningPlan] = useState({
    title: "",
    goal: "",
    skills: "",
    steps: [""],
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLearningPlan((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...learningPlan.steps];
    newSteps[index] = value;
    setLearningPlan((prev) => ({
      ...prev,
      steps: newSteps,
    }));
  };

  const addStep = () => {
    setLearningPlan((prev) => ({
      ...prev,
      steps: [...prev.steps, ""],
    }));
  };

  const removeStep = (index) => {
    setLearningPlan((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to create a learning plan");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    const planData = {
      title: learningPlan.title,
      goal: learningPlan.goal,
      skills: learningPlan.skills,
      steps: learningPlan.steps.map(step => ({
        topic: step,
        resources: "",
        timeline: "",
        mediaUrl: "",
        mediaType: "NONE",
        mediaSource: "NONE"
      })),
      mediaType: "NONE",
      mediaSource: "NONE",
      image: null,
      video: null
    };
    formData.append("plan", new Blob([JSON.stringify(planData)], { type: "application/json" }));
    if (mediaFile) {
      formData.append("media", mediaFile);
    }

    try {
      const response = await fetch("http://localhost:8080/api/learningplans", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      toast.success("Learning plan created successfully!");
      navigate("/learning");
    } catch (error) {
      console.error("Error creating learning plan:", error);
      toast.error(error.message || "Failed to create learning plan. Please try again.");
    }
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-blue-800 mb-2">
              Create Your Training Plan
            </h2>
            <p className="text-gray-600">
              Create your own cooking journey—discover, cook, and grow.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Plan Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={learningPlan.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Find recipes, cook with ease, and enjoy every bite."
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="goal"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Training Goal
                </label>
                <textarea
                  id="goal"
                  name="goal"
                  value={learningPlan.goal}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what you want to achieve with this training plan"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Skills to Master
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={learningPlan.skills}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Recipes, Techniques, Flavors"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate skills with commas
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Steps
                </label>
                {learningPlan.steps.map((step, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      required
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Training Step ${index + 1}`}
                    />
                    {learningPlan.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="px-3 py-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStep}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <FiPlus size={16} />
                  Add Training Step
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Media (Image or Video)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {mediaPreview && (
                  <div className="mt-4">
                    {mediaFile.type.startsWith("image/") ? (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-h-48 rounded-lg"
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        controls
                        className="max-h-48 rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/learning")}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <FiTarget size={16} />
                Create Training Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreatePlanDetails;