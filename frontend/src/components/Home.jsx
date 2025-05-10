import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { FiHeart, FiMessageSquare, FiShare2, FiMoreHorizontal, FiEdit, FiTrash2, FiUserPlus, FiUser, FiPlus, FiChevronDown, FiChevronUp, FiUsers } from "react-icons/fi";
import { FaHeart, FaRunning, FaSwimmer, FaBasketballBall, FaFutbol } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Story from "./Status";


const Home = () => {
  const [users, setUsers] = useState([]); 
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [isFollowing, setIsFollowing] = useState({});
  const [sportCommunities, setSportCommunities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: "", description: "" });
  const [publicPosts, setPublicPosts] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [editingComment, setEditingComment] = useState({ id: null, content: "" });
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();

  // Sample data for athletes to connect with
  const athletesToConnect = [
    { id: 1, name: "Alex Johnson", sport: "Basketball", skills: "Shooting, Defense", icon: <FaBasketballBall className="text-orange-500" /> },
    { id: 2, name: "Maria Garcia", sport: "Soccer", skills: "Dribbling, Passing", icon: <FaFutbol className="text-green-500" /> },
    { id: 3, name: "James Wilson", sport: "Tennis", skills: "Serve, Volley", icon: <FaRunning className="text-blue-500" /> },
    { id: 4, name: "Sarah Lee", sport: "Swimming", skills: "Freestyle, Butterfly", icon: <FaSwimmer className="text-cyan-500" /> },
  ];

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");
    
    setUsername(storedUsername || "Athlete");
    setUserId(storedUserId || "");
    
    if (!storedToken) {
      navigate("/login");
      return;
    }

    fetchUsers();
    fetchData();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      
      // Check follow status for each user
      const followStatus = {};
      response.data.forEach(user => {
        followStatus[user.id] = user.isFollowing;
      });
      setIsFollowing(followStatus);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchCommunities(), fetchPublicPosts()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await axios.post(
        `http://localhost:8080/api/users/${userId}/follow`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Error toggling follow:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login");
      }
    }
  };

  const getSportIcon = (skills) => {
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return <FiUser className="text-purple-500" />;
    }
    const firstSkill = skills[0]?.sport;
    if (!firstSkill || typeof firstSkill !== 'string') {
      return <FiUser className="text-purple-500" />;
    }
  
    // Now we can safely call toLowerCase()
    switch(firstSkill.toLowerCase()) {
      case 'basketball':
        return <FaBasketballBall className="text-orange-500" />;
      case 'soccer':
        return <FaFutbol className="text-green-500" />;
      case 'running':
        return <FaRunning className="text-blue-500" />;
      case 'swimming':
        return <FaSwimmer className="text-cyan-500" />;
      default:
        return <FiUser className="text-purple-500" />;
    }
  };

  const fetchCommunities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/communities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSportCommunities(response.data);
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("Failed to load communities");
    }
  };

  const fetchPublicPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8080/api/posts/public",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const postsWithDetails = await Promise.all(
        response.data.map(async (post) => {
          const [likesResponse, commentsResponse, userLikeResponse] =
            await Promise.all([
              axios.get(
                `http://localhost:8080/api/likecomment/likes/count/${post.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              ),
              axios.get(
                `http://localhost:8080/api/likecomment/comments/${post.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              ),
              axios.get(
                `http://localhost:8080/api/likecomment/user-like/${post.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    userId: token,
                  },
                }
              ),
            ]);

          return {
            ...post,
            likeCount: likesResponse.data,
            comments: commentsResponse.data.map(comment => ({
              ...comment,
              isCurrentUser: comment.userId === userId //  check if the comment belongs to the current user
            })),
            commentCount: commentsResponse.data.length,
            likedByUser: userLikeResponse.data.liked,
            isExpanded: false // Add initial expanded state
          };
        })
      );

      setPublicPosts(postsWithDetails);
    } catch (error) {
      console.error("Error fetching public posts:", error);
      toast.error("Failed to load posts");
    }
  };

  const togglePostExpand = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleLikeToggle = async (postId) => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/api/likecomment/toggle-like/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            userId: token,
            username: username,
          },
        }
      );
      fetchPublicPosts();
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error(error.response?.data?.message || "Failed to like post");
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
  
    if (!commentContent.trim()) {
      toast.warning("Please enter a comment");
      return;
    }
  
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId") || token;
    const username = localStorage.getItem("username");
  
    try {
      await axios.post(
        `http://localhost:8080/api/likecomment/comment/${postId}`,
        commentContent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            userId: userId,
            username: username,
            "Content-Type": "text/plain",
          },
        }
      );
  
      setCommentContent("");
      fetchPublicPosts();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment({ id: comment.id, content: comment.comment });
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingComment.content.trim()) {
      toast.warning("Comment cannot be empty");
      return;
    }

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId") || token;

    try {
      await axios.put(
        `http://localhost:8080/api/likecomment/comment/${commentId}`,
        editingComment.content,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            userId: userId,
            "Content-Type": "text/plain",
          },
        }
      );

      setEditingComment({ id: null, content: "" });
      fetchPublicPosts();
      toast.success("Comment updated successfully");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("You can only edit your own comments");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId") || token;

    try {
      await axios.delete(
        `http://localhost:8080/api/likecomment/comment/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            userId: userId,
          },
        }
      );
      fetchPublicPosts();
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("You can only delete your own comments");
    }
  };

  const handleCancelEdit = () => {
    setEditingComment({ id: null, content: "" });
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      await axios.post(
        "http://localhost:8080/api/communities",
        newCommunity,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewCommunity({ name: "", description: "" });
      setShowForm(false);
      fetchCommunities();
      toast.success("Community created successfully");
    } catch (error) {
      console.error("Error creating community:", error);
      toast.error(error.response?.data?.message || "Failed to create community");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
        <Story />
          {/* Welcome Header */}
          <div className="mb-8 text-center bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">
              Welcome back, <span className="text-blue-600">{username}</span>!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with fellow athletes, share your progress, and find your next training partner
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Athletes to Connect */}
            <div className="lg:w-1/4 w-full space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <FiUserPlus className="text-blue-500" />
                  Athletes Near You
                </h2>
                <ul className="space-y-4">
                  {users.map((user) => (
                    <li key={user.id} className="bg-blue-50 rounded-lg p-4 transition-all hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                          {getSportIcon(user.skills)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-900">{user.username}</h3>
                          <p className="text-sm text-blue-700 flex items-center gap-1">
                            {user.skills?.length > 0 ? (
                              <>
                                {getSportIcon(user.skills)}
                                {user.skills[0].sport}
                              </>
                            ) : "No sport specified"}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {user.followersCount} followers
                            </span>
                            <span className="text-xs text-gray-500">
                              {user.followingCount} following
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleFollow(user.id)}
                        className={`mt-3 w-full py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
                          isFollowing[user.id] 
                            ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
                            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                        }`}
                      >
                        <FiUserPlus size={14} />
                        {isFollowing[user.id] ? "Following" : "Follow"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Center Column: Posts */}
            <div className="lg:w-2/4 w-full">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab("posts")}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "posts" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                      Shared Posts
                    </button>
                    <button
                      onClick={() => setActiveTab("activities")}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "activities" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                      Recent Activities
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === "posts" ? (
                    <div className="space-y-6">
                      {publicPosts.length > 0 ? (
                        publicPosts.map((post) => (
                          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                            {/* Post Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                                {post.username?.charAt(0).toUpperCase() || "A"}
                              </div>
                              <div>
                                <h3 className="font-semibold text-blue-900">
                                  {post.username || "Anonymous Athlete"}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {post.createdAt &&
                                    formatDistanceToNow(new Date(post.createdAt), {
                                      addSuffix: true,
                                    })}
                                </p>
                              </div>
                            </div>

                            {/* Post Content */}
                            <div className="p-6">
                              <h3 className="text-xl font-bold text-blue-900 mb-2">
                                {post.title}
                              </h3>
                              
                              {/* Post Content with Read More */}
                              <div className="relative">
                                <p className={`text-gray-600 mb-4 whitespace-pre-line ${expandedPosts[post.id] ? '' : 'line-clamp-3'}`}>
                                  {post.content}
                                </p>
                                {post.content.length > 150 && (
                                  <button
                                    onClick={() => togglePostExpand(post.id)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                  >
                                    {expandedPosts[post.id] ? (
                                      <>
                                        <FiChevronUp /> Show Less
                                      </>
                                    ) : (
                                      <>
                                        <FiChevronDown /> Read More
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>

                              {/* Post Image */}
                              {post.image && (
                                <img
                                  src={post.image}
                                  alt={post.title}
                                  className="w-full h-auto max-h-96 object-cover rounded-lg mb-4"
                                />
                              )}

                              {/* Engagement Metrics */}
                              <div className="flex items-center justify-between border-t border-b border-gray-100 py-3">
                                <button
                                  onClick={() => handleLikeToggle(post.id)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    post.likedByUser
                                      ? "text-blue-500 bg-blue-50 hover:bg-blue-100"
                                      : "text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  {post.likedByUser ? (
                                    <FaHeart className="text-blue-500" />
                                  ) : (
                                    <FiHeart />
                                  )}
                                  <span className="font-medium">{post.likeCount}</span>
                                </button>

                                <button
                                  onClick={() => toggleComments(post.id)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    expandedComments[post.id]
                                      ? "text-blue-500 bg-blue-50 hover:bg-blue-100"
                                      : "text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  <FiMessageSquare />
                                  <span className="font-medium">{post.commentCount}</span>
                                </button>

                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                                  <FiShare2 />
                                  <span>Share</span>
                                </button>
                              </div>
                              {/* Comments Section */}
                              <div className={`transition-all duration-300 overflow-hidden ${expandedComments[post.id] ? 'max-h-[500px]' : 'max-h-0'}`}>
                                <div className="mt-4">
                                  {/* Existing Comments */}
                                  {post.comments && post.comments.length > 0 ? (
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                      {post.comments.map((comment) => (
                                        <div key={comment.id} className="flex items-start gap-3 relative group">
                                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 mt-1">
                                            {comment.username?.charAt(0).toUpperCase() || "U"}
                                          </div>
                                          <div className="flex-1 bg-blue-50 p-3 rounded-lg">
                                            {editingComment.id === comment.id ? (
                                              <div>
                                                <textarea
                                                  value={editingComment.content}
                                                  onChange={(e) => setEditingComment({
                                                    ...editingComment,
                                                    content: e.target.value
                                                  })}
                                                  className="w-full p-2 border border-blue-200 rounded mb-2 focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                                  rows="3"
                                                  autoFocus
                                                />
                                                <div className="flex justify-end gap-2">
                                                  <button
                                                    onClick={handleCancelEdit}
                                                    className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition"
                                                  >
                                                    Cancel
                                                  </button>
                                                  <button
                                                    onClick={() => handleUpdateComment(comment.id)}
                                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                                  >
                                                    Update
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <>
                                                <div className="flex justify-between">
                                                  <span className="font-medium text-blue-900">
                                                    {comment.username}
                                                  </span>
                                                  <span className="text-xs text-gray-400">
                                                    {comment.createdAt &&
                                                      formatDistanceToNow(new Date(comment.createdAt), {
                                                        addSuffix: true,
                                                      })}
                                                  </span>
                                                </div>
                                                <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                                  {comment.comment}
                                                </p>
                                                {comment.userId === userId && (
                                                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                      onClick={() => handleEditComment(comment)}
                                                      className="text-blue-600 hover:text-blue-800 p-1 transition"
                                                      title="Edit comment"
                                                    >
                                                      <FiEdit size={16} />
                                                    </button>
                                                    <button
                                                      onClick={() => handleDeleteComment(comment.id)}
                                                      className="text-red-600 hover:text-red-800 p-1 transition"
                                                      title="Delete comment"
                                                    >
                                                      <FiTrash2 size={16} />
                                                    </button>
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-gray-400 italic text-center py-4">
                                      No comments yet. Be the first to comment!
                                    </p>
                                  )}

                                  {/* Comment Form */}
                                  <form
                                    onSubmit={(e) => handleCommentSubmit(e, post.id)}
                                    className="mt-4"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 mt-1">
                                        {username.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex-1">
                                        <textarea
                                          value={commentContent}
                                          onChange={(e) => setCommentContent(e.target.value)}
                                          className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                                          placeholder="Write a comment..."
                                          rows="3"
                                        />
                                        <div className="flex justify-end mt-2 gap-2">
                                          <button
                                            type="button"
                                            onClick={() => toggleComments(post.id)}
                                            className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                                            disabled={!commentContent.trim()}
                                          >
                                            Post Comment
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>
                          </div>))
                      ) : (
                        <div className="text-center py-10">
                          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <FiMessageSquare className="text-blue-500 text-3xl" />
                          </div>
                          <h3 className="text-xl font-medium text-gray-800 mb-2">No posts yet</h3>
                          <p className="text-gray-500 mb-4">Be the first to share something with the community!</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <FaRunning className="text-blue-500 text-3xl" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-800 mb-2">Recent Activities</h3>
                      <p className="text-gray-500 mb-4">Coming soon - track your training progress and achievements</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Sport Communities */}
            <div className="lg:w-1/4 w-full space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                    <FiUser className="text-blue-500" />
                    Sport Communities
                  </h2>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-3 py-1 rounded-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center gap-1"
                  >
                    <FiPlus size={14} />
                    {showForm ? 'Cancel' : 'New'}
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={handleCreateCommunity} className="mb-6 bg-blue-50 p-4 rounded-lg">
                    <input
                      type="text"
                      placeholder="Community Name"
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                      className="w-full border border-blue-200 p-3 rounded-lg mb-3 focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                      className="w-full border border-blue-200 p-3 rounded-lg mb-3 focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                      rows="3"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition font-medium"
                    >
                      Create Community
                    </button>
                  </form>
                )}

                <div className="space-y-4">
                  {sportCommunities.length > 0 ? (
                    sportCommunities.map((community) => (
                      <div 
                        key={community.id} 
                        className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer"
                        onClick={() => navigate(`/community/${community.id}`)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                            {getSportIcon(community.name)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-blue-900">{community.name}</h3>
                            <p className="text-sm text-gray-600 my-1 line-clamp-2">{community.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-blue-600">
                                {community.members?.length || 0} members
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                View
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <FiUser className="text-blue-500 text-2xl" />
                      </div>
                      <p className="text-gray-500">No communities yet</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Create your first community
                      </button>
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

export default Home;
