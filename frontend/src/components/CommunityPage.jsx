import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

const CommunityPage = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editCommunity, setEditCommunity] = useState({ name: "", description: "" });
  const [newPost, setNewPost] = useState({ content: "", image: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunity();
    fetchPosts();
  }, [id]);

  const fetchCommunity = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/communities/${id}`);
      setCommunity(res.data);
    } catch (err) {
      console.error("Error fetching community:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/communities/${id}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const getUserName = () => {
    const userName = localStorage.getItem("userName");
    if (!userName) {
      alert("You must be signed in to perform this action.");
      navigate("/login");
      return null;
    }
    return userName;
  };

  const handleJoinCommunity = async () => {
    const userName = getUserName();
    if (!userName) return;

    try {
      await axios.post(`http://localhost:8080/api/communities/${id}/join`, null, {
        params: { userName },
      });
      alert("You have joined the community!");
      fetchCommunity();
    } catch (err) {
      console.error("Error joining community:", err);
      alert(err.response?.data?.message || "Error joining community");
    }
  };

  const handleLeaveCommunity = async () => {
    const userName = getUserName();
    if (!userName) return;

    try {
      await axios.post(`http://localhost:8080/api/communities/${id}/leave`, null, {
        params: { userName },
      });
      alert("You have left the community.");
      fetchCommunity();
    } catch (err) {
      console.error("Error leaving community:", err);
      alert(err.response?.data?.message || "Error leaving community");
    }
  };

  const handleAddPost = async () => {
    const userName = getUserName();
    if (!userName) return;

    try {
      const post = {
        ...newPost,
        author: userName,
        date: new Date().toISOString().split("T")[0],
        likes: 0,
        communityId: id
      };
      await axios.post(`http://localhost:8080/api/communities/${id}/posts`, post);
      setNewPost({ content: "", image: "" });
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      console.error("Error adding post:", err);
    }
  };

  const handleLike = async (postId) => {
    const userName = getUserName();
    if (!userName) return;

    try {
      await axios.post(
        `http://localhost:8080/api/communities/${id}/posts/${postId}/like`,
        null,
        { params: { userName } }
      );
      fetchPosts();
    } catch (error) {
      if (error.response?.status === 400) {
        alert("You've already liked this post.");
      } else {
        console.error("Error liking post:", error);
      }
    }
  };

  const handleChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleEditCommunity = () => {
    setEditMode(true);
    setEditCommunity({ name: community.name, description: community.description });
  };

  const handleUpdateCommunity = async () => {
    try {
      await axios.put(`http://localhost:8080/api/communities/${id}`, editCommunity);
      alert("Community updated successfully!");
      setEditMode(false);
      fetchCommunity();
    } catch (err) {
      console.error("Error updating community:", err);
      alert("Update failed. Please try again.");
    }
  };

  const handleDeleteCommunity = async () => {
    if (!window.confirm("Are you sure you want to delete this community?")) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/communities/${id}`);
      alert("Community deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting community:", error);
      alert("An error occurred while deleting the community.");
    }
  };

  const handleEditChange = (e) => {
    setEditCommunity({ ...editCommunity, [e.target.name]: e.target.value });
  };

  if (!community) return <div className="text-center py-10">Loading community...</div>;

  const isMember = community.members?.includes(getUserName());
  const canEdit = true; // Add your logic for edit permissions if needed

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#FFFBF2] via-[#FFDCB9] to-[#FFAA6B] p-4 md:p-10 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Members Section */}
            <div className="lg:w-1/4 w-full">
              <div className="bg-white p-6 rounded-xl shadow-lg sticky top-4">
                <h3 className="text-2xl font-semibold text-[#F97316] mb-4">Community Members</h3>
                <div className="max-h-96 overflow-y-auto">
                  {community.members?.length > 0 ? (
                    <ul className="space-y-3">
                      {community.members.map((member, i) => (
                        <li key={i} className="p-3 rounded-lg bg-gray-100 shadow-sm">
                          {member}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No members yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-2/4 w-full space-y-6">
              {/* Community Info */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                {!editMode ? (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-3xl font-bold text-[#F97316] mb-2">{community.name}</h2>
                        <p className="text-[#4B5563] mb-4">{community.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!isMember ? (
                          <button
                            onClick={handleJoinCommunity}
                            className="bg-[#10B981] text-white px-4 py-2 rounded hover:bg-[#059669] transition"
                          >
                            Join Community
                          </button>
                        ) : (
                          <button
                            onClick={handleLeaveCommunity}
                            className="bg-[#EF4444] text-white px-4 py-2 rounded hover:bg-[#DC2626] transition"
                          >
                            Leave Community
                          </button>
                        )}
                        {canEdit && (
                          <>
                            <button
                              onClick={handleEditCommunity}
                              className="bg-[#2563EB] text-white px-4 py-2 rounded hover:bg-[#1D4ED8] transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={handleDeleteCommunity}
                              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold mb-4 text-[#F97316]">Edit Community</h3>
                    <input
                      type="text"
                      name="name"
                      placeholder="Community Name"
                      value={editCommunity.name}
                      onChange={handleEditChange}
                      className="w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                      required
                    />
                    <textarea
                      name="description"
                      placeholder="Community Description"
                      value={editCommunity.description}
                      onChange={handleEditChange}
                      className="w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                      rows="3"
                      required
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateCommunity}
                        className="bg-[#10B981] text-white px-4 py-2 rounded hover:bg-[#059669] transition"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Create Post */}
              {isMember && (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  {!showForm ? (
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full bg-[#2563EB] text-white px-4 py-3 rounded-lg hover:bg-[#1D4ED8] transition font-medium"
                    >
                      Create New Post
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-[#F97316]">Create Post</h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold">
                          {getUserName()?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{getUserName()}</span>
                      </div>
                      <textarea
                        name="content"
                        placeholder="What's on your mind?"
                        value={newPost.content}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                        rows="4"
                        required
                      />
                      <input
                        type="text"
                        name="image"
                        placeholder="Image URL (optional)"
                        value={newPost.image}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                      />
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setShowForm(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddPost}
                          className="bg-[#10B981] text-white px-4 py-2 rounded-lg hover:bg-[#059669] transition"
                          disabled={!newPost.content}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Posts List */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-semibold text-[#F97316] mb-6">Community Posts</h3>
                {posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div key={post.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold">
                            {post.author?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{post.author}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-800 mb-3 whitespace-pre-line">{post.content}</p>
                        {post.image && (
                          <img
                            src={post.image}
                            alt="Post content"
                            className="rounded-lg mb-3 max-h-80 w-full object-cover"
                          />
                        )}
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => handleLike(post.id)}
                            className="flex items-center space-x-1 text-[#EF4444] hover:text-[#DC2626] transition"
                          >
                            <span className="text-xl">❤️</span>
                            <span>{post.likes} Like{post.likes !== 1 ? 's' : ''}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No posts yet. Be the first to share something!
                  </div>
                )}
              </div>
            </div>

            {/* Community Stats */}
            <div className="lg:w-1/4 w-full">
              <div className="bg-white p-6 rounded-xl shadow-lg sticky top-4 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#F97316] mb-2">Community Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Members</span>
                      <span className="font-medium">{community.members?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Posts</span>
                      <span className="font-medium">{posts.length}</span>
                    </div>
                  </div>
                </div>
                {isMember && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[#F97316] mb-2">Quick Actions</h3>
                    <button
                      onClick={() => {
                        if (!getUserName()) return;
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full bg-[#F97316] text-white py-2 px-4 rounded-md hover:bg-[#FF9F00] transition"
                    >
                      Create Post
                    </button>
                    <button
                      onClick={handleLeaveCommunity}
                      className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                    >
                      Leave Community
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityPage;