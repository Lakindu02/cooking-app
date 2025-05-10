import React, { useEffect, useState } from "react";
import axios from "axios";
import ImageUploader from "./ImageUploader";
import { FiPlus, FiX } from "react-icons/fi";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Story = () => {
  const [stories, setStories] = useState([]);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewingIndex, setViewingIndex] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showViewerMenu, setShowViewerMenu] = useState(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState(null);
  const [progress, setProgress] = useState(0);
  const [editDescription, setEditDescription] = useState("");

  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const fetchStories = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/story/getAllStatus", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStories(res.data.reverse());
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const handleImageUpload = (file) => {
    setImageFile(file);
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!imageFile || !description) {
      alert("Please add an image and description.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("description", description);
    formData.append("userid", userId);
    formData.append("uname", username);

    try {
      await axios.post("http://localhost:8080/api/story/createStory", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setDescription("");
      setImageFile(null);
      setShowModal(false);
      fetchStories();
    } catch (error) {
      toast.error("Failed to create status");
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const userStories = stories.filter((s) => s.userId === userId);
  const otherStories = stories.filter((s) => s.userId !== userId);
  const allStories = [...userStories, ...otherStories];

  useEffect(() => {
    let progressInterval;

    if (viewingIndex !== null) {
      setProgress(0);

      const timer = setTimeout(() => {
        setViewingIndex((prevIndex) =>
          prevIndex < allStories.length - 1 ? prevIndex + 1 : 0
        );
      }, 10000);

      progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
      }, 100);

      setAutoPlayTimer(timer);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [viewingIndex, allStories.length]);

  const handleUpdateStory = async () => {
    try {
      const storyId = stories[viewingIndex].id;
      await axios.patch("http://localhost:8080/api/story/updateStory", {
        id: storyId,
        description: editDescription,
        uname: username,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Status updated successfully");
      setShowViewerMenu(false);
      fetchStories();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteStory = async () => {
    try {
      const storyId = allStories[viewingIndex].id;
      await axios.delete("http://localhost:8080/api/story/deleteStory", {
        params: { id: storyId, uname: username },
        headers: { Authorization: `Bearer ${token}` },
      });   
      toast.success("Status deleted successfully ✅");   
      setViewingIndex(null);
      setShowViewerMenu(false);
      fetchStories();
    } catch (error) {
      toast.error("Failed to delete status");
    }
  };

  return (
    <div className="bg-white p-4 mb-6 rounded-xl shadow-md">
      <ToastContainer position="bottom-center" autoClose={3000} />
      <h2 className="text-xl font-bold text-blue-700 mb-4">Statuses</h2>

      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
        {userStories.length === 0 && (
          <div
            className="flex-shrink-0 w-28 h-48 rounded-lg bg-blue-100 flex flex-col justify-center items-center text-blue-700 hover:bg-blue-200 cursor-pointer relative"
            onClick={() => setShowModal(true)}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-blue-700 shadow-md">
              <FiPlus size={24} />
            </div>
            <span className="text-sm mt-2 font-medium">Add Status</span>
          </div>
        )}

        {allStories.map((story, index) => (
          <div
            key={story.id}
            className="relative flex-shrink-0 w-28 h-48 rounded-lg overflow-hidden shadow-md cursor-pointer group"
            onClick={() => {
              setViewingIndex(index);
              setEditDescription(story.description);
              setShowViewerMenu(false);
            }}
          >
            <img
              src={`http://localhost:8080/status/${story.id}.jpg`}
              alt="Status"
              className="w-full h-full object-cover group-hover:opacity-90"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent px-2 py-1">
              <p className="text-xs text-white font-semibold truncate">{story.uname}</p>
            </div>

            {story.uname === username && (
              <div
                className="absolute top-1 right-1 text-white cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown((prev) => !prev);
                }}
              >
                <HiOutlineDotsVertical size={18} />
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
              onClick={() => setShowModal(false)}
            >
              <FiX size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-4 text-blue-700">Create a Status</h3>

            <form onSubmit={handleCreateStory}>
              <label className="block font-medium text-sm text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                placeholder="What's happening?"
              />
              <ImageUploader onImageUpload={handleImageUpload} />
              <button
                type="submit"
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Post Status
              </button>
            </form>
          </div>
        </div>
      )}

      {viewingIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-[360px] h-[640px] bg-black rounded-xl overflow-hidden shadow-lg">
            <div className="w-full h-1 bg-gray-700 absolute top-0 left-0 z-20">
              <div
                className="h-full bg-blue-500 transition-all duration-100 linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <button
              onClick={() => {
                setViewingIndex(null);
                clearTimeout(autoPlayTimer);
              }}
              className="absolute top-2 right-2 text-white bg-red-500 p-1 rounded-full hover:bg-red-600 z-40"
            >
              <FiX size={20} />
            </button>

            {allStories[viewingIndex].uname === username && (
              <>
                <div
                  className="absolute top-2 right-12 flex items-center justify-center w-8 h-8 bg-black bg-opacity-60 text-white rounded-full z-50 cursor-pointer hover:bg-opacity-80"
                  onClick={() => setShowViewerMenu((prev) => !prev)}
                >
                  <HiOutlineDotsVertical size={18} />
                </div>

                {showViewerMenu && (
                  <div className="absolute top-12 right-12 bg-white text-sm rounded shadow z-50">
                    <button
                      onClick={handleUpdateStory}
                      className="block px-4 py-2 text-blue-600 hover:bg-gray-100 w-full text-left"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={handleDeleteStory}
                      className="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left"
                    >
                      Delete Status
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="absolute top-3 left-3 z-20 bg-black bg-opacity-40 px-3 py-1 rounded-full">
              <p className="text-sm text-white font-semibold">
                {allStories[viewingIndex].uname}
              </p>
            </div>

            <img
              src={`http://localhost:8080/status/${allStories[viewingIndex].id}.jpg`}
              alt="Status"
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-4 text-white text-sm font-medium text-center">
              {allStories[viewingIndex].userId === userId ? (
                <input
                  type="text"
                  className="w-full text-center bg-transparent border-none outline-none text-white"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              ) : (
                allStories[viewingIndex].description
              )}
            </div>

            {/* Navigation Areas */}
            <div
              className="absolute top-0 left-0 h-full w-1/3 cursor-pointer"
              onClick={() => {
                clearTimeout(autoPlayTimer);
                setViewingIndex((prev) =>
                  prev > 0 ? prev - 1 : allStories.length - 1
                );
              }}
            />
            <div
              className="absolute top-0 right-0 h-full w-1/3 cursor-pointer"
              onClick={() => {
                clearTimeout(autoPlayTimer);
                setViewingIndex((prev) =>
                  prev < allStories.length - 1 ? prev + 1 : 0
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Story;
