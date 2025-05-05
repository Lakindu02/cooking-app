import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { FiHeart, FiMessageSquare, FiShare2, FiMoreHorizontal, FiEdit, FiTrash2, FiUserPlus, FiUserMinus } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CommunityPage = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editCommunity, setEditCommunity] = useState({ name: "", description: "" });
  const [newPost, setNewPost] = useState({ content: "", image: "" });
  const [loading, setLoading] = useState({ community: true, posts: true });
  const [error, setError] = useState({ community: null, posts: null });
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();

  // Configure axios instance with auth header
  const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  useEffect(() => {
    fetchCommunity();
    fetchPosts();
  }, [id]);

  const fetchCommunity = async () => {
    try {
      setLoading(prev => ({ ...prev, community: true }));
      const res = await api.get(`/communities/${id}`);
      setCommunity(res.data);
      setError(prev => ({ ...prev, community: null }));
    } catch (err) {
      console.error("Error fetching community:", err);
      setError(prev => ({ ...prev, community: err.response?.data?.message || "Failed to load community" }));
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(prev => ({ ...prev, community: false }));
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(prev => ({ ...prev, posts: true }));
      const res = await api.get(`/communities/${id}/posts`);
      setPosts(res.data);
      setError(prev => ({ ...prev, posts: null }));
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(prev => ({ ...prev, posts: err.response?.data?.message || "Failed to load posts" }));
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  };

  const getUserName = () => {
    const userName = localStorage.getItem("userName");
    if (!userName) {
      toast.warning("You must be signed in to perform this action.");
      navigate("/login");
      return null;
    }
    return userName;
  };

  const handleJoinCommunity = async () => {
    const userName = getUserName();
    if (!userName) return;

    try {
      await api.post(`/communities/${id}/join`, null, {
        params: { userName }
      });
      toast.success("Successfully joined the community!");
      fetchCommunity();
    } catch (err) {
      console.error("Error joining community:", err);
      toast.error(err.response?.data?.message || "Failed to join community.");
    }
  };

  const handleLeaveCommunity = async () => {
    const userName = getUserName();
    if (!userName) return;

    try {
      await api.post(`/communities/${id}/leave`, null, {
        params: { userName },
      });
      toast.success("You have left the community.");
      fetchCommunity();
    } catch (err) {
      console.error("Error leaving community:", err);
      toast.error(err.response?.data?.message || "Error leaving community");
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
      await api.post(`/communities/${id}/posts`, post);
      setNewPost({ content: "", image: "" });
      setShowForm(false);
      fetchPosts();
      toast.success("Post created successfully!");
    } catch (err) {
      console.error("Error adding post:", err);
      toast.error(err.response?.data?.message || "Failed to create post");
    }
  };

  const handleLike = async (postId) => {
    const userName = getUserName();
    if (!userName) return;

    try {
      await api.post(
        `/communities/${id}/posts/${postId}/like`,
        null,
        { params: { userName } }
      );
      fetchPosts();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.info("You've already liked this post.");
      } else {
        console.error("Error liking post:", error);
        toast.error(error.response?.data?.message || "Failed to like post");
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
      await api.put(`/communities/${id}`, editCommunity);
      toast.success("Community updated successfully!");
      setEditMode(false);
      fetchCommunity();
    } catch (err) {
      console.error("Error updating community:", err);
      toast.error(err.response?.data?.message || "Update failed. Please try again.");
    }
  };

  const handleDeleteCommunity = async () => {
    if (!window.confirm("Are you sure you want to delete this community?")) return;
    
    try {
      await api.delete(`/communities/${id}`);
      toast.success("Community deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting community:", error);
      toast.error(error.response?.data?.message || "An error occurred while deleting the community.");
    }
  };

  const handleEditChange = (e) => {
    setEditCommunity({ ...editCommunity, [e.target.name]: e.target.value });
  };

  if (loading.community) return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error.community) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-blue-500 mb-4">Error Loading Community</h2>
        <p className="text-gray-600 mb-6">{error.community}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (!community) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Community Not Found</h2>
        <p className="text-gray-600 mb-6">The community you're looking for doesn't exist or may have been removed.</p>
        <button 
          onClick={() => navigate("/")}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Browse Communities
        </button>
      </div>
    </div>
  );

  const isMember = community.members?.includes(getUserName());
  const canEdit = true; // Add your logic for edit permissions if needed

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-blue-50">
        {/* Community Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-6 md:mb-0">
                {!editMode ? (
                  <>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{community.name}</h1>
                    <p className="text-white text-opacity-90 max-w-2xl">{community.description}</p>
                  </>
                ) : (
                  <div className="w-full">
                    <input
                      type="text"
                      name="name"
                      placeholder="Community Name"
                      value={editCommunity.name}
                      onChange={handleEditChange}
                      className="w-full mb-3 p-3 bg-blue bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-xl font-bold"
                      required
                    />
                    <textarea
                      name="description"
                      placeholder="Community Description"
                      value={editCommunity.description}
                      onChange={handleEditChange}
                      className="w-full p-3 bg-blue bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                      rows="2"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                {!editMode ? (
                  <>
                    {!isMember ? (
                      <button
                        onClick={handleJoinCommunity}
                        className="flex items-center gap-2 bg-white text-green-600 px-5 py-2.5 rounded-lg hover:bg-gray-100 transition font-medium"
                      >
                        <FiUserPlus size={18} />
                        Join Community
                      </button>
                    ) : (
                      <button
                        onClick={handleLeaveCommunity}
                        className="flex items-center gap-2 bg-white text-red-600 px-5 py-2.5 rounded-lg hover:bg-gray-100 transition font-medium"
                      >
                        <FiUserMinus size={18} />
                        Leave Community
                      </button>
                    )}
                    {canEdit && (
                      <>
                        <button
                          onClick={handleEditCommunity}
                          className="flex items-center gap-2 bg-black bg-opacity-20 text-white px-5 py-2.5 rounded-lg hover:bg-opacity-30 transition font-medium"
                        >
                          <FiEdit size={18} />
                          Edit
                        </button>
                        <button
                          onClick={handleDeleteCommunity}
                          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition font-medium"
                        >
                          <FiTrash2 size={18} />
                          Delete
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleUpdateCommunity}
                      className="flex items-center gap-2 bg-green bg-opacity-20  text-white px-5 py-2.5 rounded-lg hover:bg-gray transition font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex items-center gap-2 bg-black bg-opacity-20 text-white px-5 py-2.5 rounded-lg hover:bg-red transition font-medium"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-1/4 w-full space-y-6">
              {/* Community Stats */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Community Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-600">Members</span>
                    <span className="font-bold text-blue-600">{community.members?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-600">Posts</span>
                    <span className="font-bold text-blue-600">{posts.length}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {isMember && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (!getUserName()) return;
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 transition font-medium"
                    >
                      <FiEdit size={16} />
                      Create Post
                    </button>
                    <button
                      onClick={handleLeaveCommunity}
                      className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      <FiUserMinus size={16} />
                      Leave Community
                    </button>
                  </div>
                </div>
              )}

              {/* Members */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Members</h3>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {community.members?.length || 0}
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {community.members?.length > 0 ? (
                    <ul className="space-y-3">
                      {community.members.map((member, i) => (
                        <li key={i} className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {member?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{member}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No members yet</p>
                      <button
                        onClick={handleJoinCommunity}
                        className="mt-3 text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Be the first to join!
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 w-full">
              {/* Create Post */}
              {isMember && showForm && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-800">Create Post</h3>
                      <button
                        onClick={() => setShowForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FiMoreHorizontal size={20} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {getUserName()?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{getUserName()}</span>
                    </div>
                    <textarea
                      name="content"
                      placeholder="What's on your mind?"
                      value={newPost.content}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="4"
                      required
                    />
                    <input
                      type="text"
                      name="image"
                      placeholder="Image URL (optional)"
                      value={newPost.image}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowForm(false)}
                        className="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddPost}
                        className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                        disabled={!newPost.content}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Posts */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab("posts")}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "posts" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                      Posts
                    </button>
                    <button
                      onClick={() => setActiveTab("about")}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "about" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                      About
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === "posts" ? (
                    <>
                      {!showForm && isMember && (
                        <div 
                          onClick={() => setShowForm(true)}
                          className="flex items-center gap-3 p-3 mb-6 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {getUserName()?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-500">What's on your mind?</span>
                        </div>
                      )}

                      {loading.posts ? (
                        <div className="flex justify-center py-10">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : error.posts ? (
                        <div className="text-center py-10">
                          <p className="text-red-500 mb-4">{error.posts}</p>
                          <button
                            onClick={fetchPosts}
                            className="text-blue-500 hover:text-blue-600 font-medium"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : posts.length > 0 ? (
                        <div className="space-y-6">
                          {posts.map((post) => (
                            <div key={post.id} className="border-b border-gray-200 pb-6 last:border-0">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                    {post.author?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium">{post.author}</div>
                                    <div className="text-sm text-gray-500">
                                      {new Date(post.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <FiMoreHorizontal />
                                </button>
                              </div>
                              <p className="text-gray-800 mb-4 whitespace-pre-line">{post.content}</p>
                              {post.image && (
                                <img
                                  src={post.image}
                                  alt="Post content"
                                  className="rounded-lg mb-4 w-full h-auto max-h-96 object-cover"
                                />
                              )}
                              <div className="flex justify-between items-center text-gray-500">
                                <button
                                  onClick={() => handleLike(post.id)}
                                  className="flex items-center gap-1 hover:text-blue-500 transition"
                                >
                                  {post.likes > 0 ? (
                                    <FaHeart className="text-blue-500" />
                                  ) : (
                                    <FiHeart />
                                  )}
                                  <span>{post.likes} Like{post.likes !== 1 ? 's' : ''}</span>
                                </button>
                                <div className="flex gap-4">
                                  <button className="flex items-center gap-1 hover:text-blue-500 transition">
                                    <FiMessageSquare />
                                    <span>Comment</span>
                                  </button>
                                  <button className="flex items-center gap-1 hover:text-blue-500 transition">
                                    <FiShare2 />
                                    <span>Share</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <FiMessageSquare className="text-blue-500 text-3xl" />
                          </div>
                          <h3 className="text-xl font-medium text-gray-800 mb-2">No posts yet</h3>
                          <p className="text-gray-500 mb-4">Be the first to share something with the community!</p>
                          {isMember && (
                            <button
                              onClick={() => setShowForm(true)}
                              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                            >
                              Create Post
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">About {community.name}</h3>
                        <p className="text-gray-600 whitespace-pre-line">{community.description}</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Community Guidelines</h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span>Be respectful to all members</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span>No spam or self-promotion</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span>Keep discussions relevant to the community</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span>Report any inappropriate content</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityPage;