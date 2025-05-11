import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { FiHeart, FiMessageSquare, FiShare2, FiEdit, FiTrash2, FiUserPlus, FiUser, FiPlus, FiChevronDown, FiChevronUp, FiUserMinus, FiUsers } from "react-icons/fi";
import { FaHeart, FaRunning, FaSwimmer, FaBasketballBall, FaFutbol } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  // ... (other state declarations remain unchanged)
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
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();
  const [unauthorizedAlert, setUnauthorizedAlert] = useState({
    show: false,
    message: ""
  });
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    message: "",
    type: "" // 'like', 'comment', 'edit', 'delete'
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");
    
    console.log("Home component - Stored values:", { storedUsername, storedUserId, storedToken });
    
    if (!storedToken || !storedUserId) {
      console.log("Home component - Missing token or userId, redirecting to login");
      navigate("/login");
      return;
    }

    console.log("Home component - Setting user state with:", { storedUserId, storedUsername });
    setUsername(storedUsername || "Athlete");
    setUserId(storedUserId);
    setCurrentUser({ id: storedUserId, username: storedUsername });
    
    fetchUsers();
    fetchData();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentUserId = localStorage.getItem("userId");
      
      const response = await axios.get("http://localhost:8080/api/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Check follow status for each user
      const usersWithFollowStatus = await Promise.all(
        response.data.map(async (user) => {
          try {
            const isFollowingResponse = await axios.get(
              `http://localhost:8080/api/users/${currentUserId}/is-following/${user.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            return {
              ...user,
              isFollowing: isFollowingResponse.data
            };
          } catch (error) {
            console.error(`Error checking follow status for user ${user.id}:`, error);
            return {
              ...user,
              isFollowing: false
            };
          }
        })
      );
      
      setUsers(usersWithFollowStatus);
      
      // Update follow status in state
      const followStatus = {};
      usersWithFollowStatus.forEach(user => {
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

  const showUnauthorizedAlert = (message) => {
    setUnauthorizedAlert({ show: true, message });
    setTimeout(() => {
      setUnauthorizedAlert({ show: false, message: "" });
    }, 5000); // Hide after 5 seconds
  };

  const showSuccessAlert = (message) => {
    setSuccessAlert({ show: true, message });
    setTimeout(() => {
      setSuccessAlert({ show: false, message: "" });
    }, 5000); // Hide after 5 seconds
  };

  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const currentUserId = localStorage.getItem("userId");
      
      console.log("Follow attempt details:", {
        currentUserId,
        targetUserId: userId,
        token: token ? "present" : "missing",
        currentUser: users.find(u => u.id === currentUserId),
        targetUser: users.find(u => u.id === userId)
      });
      
      if (!token || !currentUserId) {
        console.log("Missing token or userId in handleFollow");
        toast.error("Please log in to follow users");
        navigate("/login");
        return;
      }

      // Prevent self-following
      if (currentUserId === userId) {
        toast.error("You cannot follow yourself");
        return;
      }

      // Check if already following
      const targetUser = users.find(user => user.id === userId);
      if (targetUser?.isFollowing) {
        toast.error("You are already following this user");
        return;
      }

      console.log("Making follow request to:", `http://localhost:8080/api/users/${currentUserId}/follow/${userId}`);
      const res = await axios.post(
        `http://localhost:8080/api/users/${currentUserId}/follow/${userId}`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Follow response:", res.data);
      
      // Update the UI
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                followersCount: (user.followersCount || 0) + 1,
                isFollowing: true
              }
            : user
        )
      );
      
      toast.success("Successfully followed user");
    } catch (error) {
      console.error("Error toggling follow:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        response: error.response,
        request: error.request
      });
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || "Invalid follow request";
        console.error("Follow request failed:", errorMessage);
        toast.error(errorMessage);
      } else {
        toast.error(error.response?.data?.message || "Failed to follow user");
      }
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const currentUserId = localStorage.getItem("userId");
      
      console.log("Unfollow attempt:", { currentUserId, targetUserId: userId, token: token ? "present" : "missing" });
      
      if (!token || !currentUserId) {
        console.log("Missing token or userId in handleUnfollow");
        toast.error("Please log in to unfollow users");
        navigate("/login");
        return;
      }

      if (currentUserId === userId) {
        toast.error("You cannot unfollow yourself");
        return;
      }

      const res = await axios.post(
        `http://localhost:8080/api/users/${currentUserId}/unfollow/${userId}`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update the UI
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                followers: (user.followers || []).filter(id => id !== currentUserId),
                followersCount: Math.max((user.followersCount || 0) - 1, 0),
                isFollowing: false
              }
            : user
        )
      );
      
      toast.success("Successfully unfollowed user");
    } catch (error) {
      console.error("Error unfollowing user:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to unfollow user");
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

  const handleUpdateComment = async (commentId) => {
    if (!editingComment.content.trim()) {
      toast.warning("Comment cannot be empty");
      return;
    }

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId") || token;
    const username = localStorage.getItem("username");

    // Validate userId presence
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/likecomment/comment/${commentId}`,
        editingComment.content,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            userId: userId,
            username: username,
            "Content-Type": "text/plain",
          },
        }
      );

      setEditingComment({ id: null, content: "" });
      fetchPublicPosts();
      showSuccessAlert("Comment edited Successfully");
    } catch (error) {
      console.error("Error updating comment:", error);
      if (error.response?.status === 403) {
        toast.error("You can only edit your own comments");
      } else {
        toast.error("Failed to update comment");
      }
    }
  };

  const handleEditComment = (comment) => {
    const currentUserId = localStorage.getItem("userId");
    console.log("Current User ID:", currentUserId);
    console.log("Comment User ID:", comment.userId);
    
    if (comment.userId !== currentUserId) {
      showUnauthorizedAlert("You are unauthorized to edit this comment");
      return;
    }
    setEditingComment({ id: comment.id, content: comment.comment });
  };
  
  const handleDeleteComment = async (commentId, commentUserId) => {
    const currentUserId = localStorage.getItem("userId");
    if (commentUserId !== currentUserId) {
      showUnauthorizedAlert("You are unauthorized to delete this comment");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    try {
      await axios.delete(
        `http://localhost:8080/api/likecomment/comment/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            userId: currentUserId,
            username: username,
            "Content-Type": "text/plain",
          },
        }
      );
      fetchPublicPosts();
      showSuccessAlert("Comment Deleted Successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
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
      {unauthorizedAlert.show && (
        <div className="fixed top-16 left-0 right-0 z-50 flex justify-center">
          <div className="bg-red-500 text-white px-6 py-3 rounded-md shadow-lg flex items-center">
            <span>{unauthorizedAlert.message}</span>
            <button 
              onClick={() => setUnauthorizedAlert({ show: false, message: "" })}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {successAlert.show && (
        <div className="fixed top-16 left-0 right-0 z-50 flex justify-center">
          <div className="bg-green-500 text-white px-6 py-3 rounded-md shadow-lg flex items-center">
            <span>{successAlert.message}</span>
            <button 
              onClick={() => setSuccessAlert({ show: false, message: "" })}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8 text-center bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">
              Welcome back, <span className="text-blue-600">{username}</span>!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover new recipes, share your culinary creations, and connect with fellow food lovers in one delicious app.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Athletes to Connect */}
            <div className="lg:w-1/4 w-full space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <FiUserPlus className="text-blue-500" />
                  Foods Near You
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
                            ) : "No food specified"}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {user.followersCount || 0} followers
                            </span>
                            <span className="text-xs text-gray-500">
                              {user.followingCount || 0} following
                            </span>
                          </div>
                        </div>
                      </div>
                      {user.id !== userId && (
                        <button 
                          onClick={() =>
                            user.isFollowing
                              ? handleUnfollow(user.id)
                              : handleFollow(user.id)
                          }
                          className={`mt-3 w-full py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
                            user.isFollowing
                              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                          }`}
                        >
                          {user.isFollowing ? (
                            <>
                              <FiUserMinus />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <FiUserPlus />
                              Follow
                            </>
                          )}
                        </button>
                      )}
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
                                  {post.username || "Anonymous"}
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
                                        <div className="flex-1 bg-blue-50 p-3 rounded-lg relative">
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
                                              <div className="flex justify-between items-center mb-1">
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

                                                <div className="absolute top-2 right-2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                  <button
                                                    onClick={() => handleEditComment(comment)}
                                                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-110 transition-all duration-200 relative group/edit"
                                                    title="Edit comment"
                                                  >
                                                    <FiEdit size={16} />
                                                    <span className="absolute hidden group-hover/edit:block -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                                                      Edit
                                                    </span>
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteComment(comment.id, comment.userId)}
                                                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:scale-110 transition-all duration-200 relative group/delete"
                                                    title="Delete comment"
                                                  >
                                                    <FiTrash2 size={16} />
                                                    <span className="absolute hidden group-hover/delete:block -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                                                      Delete
                                                    </span>
                                                  </button>
                                                </div>
                                    
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
                      <p className="text-gray-500 mb-4">Coming soon - track your cooking progress and achievements</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Food Communities */}
            <div className="lg:w-1/4 w-full space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                    <FiUser className="text-blue-500" />
                    Food Communities
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
