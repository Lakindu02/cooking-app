import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { FaUserCircle, FaLock, FaGlobe, FaShareAlt, FaPlus, FaTimes, FaEdit, FaPhone, FaHome, FaGraduationCap, FaStar, FaUserFriends } from "react-icons/fa";
import { FiTrash2, FiEdit2, FiUserPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Select from 'react-select';

const ProfilePage = () => {
  // State declarations
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: "",
    isPublic: true,
  });
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phoneNo: "",
    address: "",
    education: "",
    skills: [],
    followersCount: 0,
    followingCount: 0,
    photoURL: "",
    isCurrentUser: false
  });
  const [availableSports, setAvailableSports] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null); 
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const navigate = useNavigate();
  const { userId: profileUserId } = useParams();
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Configure axios instance with auth header
  const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', currentUserId);

      const response = await api.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update profile data with new image URL
      setProfileData(prev => ({
        ...prev,
        photoURL: response.data
      }));

      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

 useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Determine if we're viewing our own profile or someone else's
        const isCurrentUser = !profileUserId || profileUserId === currentUserId;
        const endpoint = isCurrentUser ? "/users/profile" : `/users/${profileUserId}/profile`;
        
        const response = await api.get(endpoint);
        console.log("Profile data response:", response.data); // Debug log
        
        setProfileData({
          username: response.data.username,
          email: response.data.email,
          phoneNo: response.data.phoneNo || '',
          address: response.data.address || '',
          education: response.data.education || '',
          skills: response.data.skills || [],
          followersCount: response.data.followers?.length || 0,
          followingCount: response.data.following?.length || 0,
          photoURL: response.data.photoURL || "https://via.placeholder.com/150",
          isCurrentUser
        });

        // Only check follow status if viewing another user's profile
        if (!isCurrentUser) {
          setIsFollowing(response.data.isFollowing || false);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    const fetchSports = async () => {
      try {
        const response = await api.get("/users/skills/sports");
        const sportsOptions = response.data.map(sport => ({
          value: sport,
          label: sport
        }));
        setAvailableSports(sportsOptions);
      } catch (error) {
        console.error("Error fetching sports:", error);
        toast.error("Failed to load sports");
      }
    };

    const fetchUserData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Fetch user posts
        const endpoint = profileUserId 
          ? `/posts/user/${profileUserId}`
          : "/posts/byLoggedInUser";
        const postsResponse = await api.get(endpoint);
        setPosts(postsResponse.data);

        // Fetch user communities
        await fetchUserCommunities();
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchProfileData();
    fetchSports();
    fetchSkillsForSport();
    fetchUserData();
  }, [token]);

  const handleFollowToggle = async () => {
    try {
      const endpoint = isFollowing ? "unfollow" : "follow";
      await api.post(`/users/${profileUserId}/${endpoint}`);
      
      // Update the followers count and follow status
      setProfileData(prev => ({
        ...prev,
        followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      }));
      setIsFollowing(!isFollowing);
      
      toast.success(isFollowing ? "Unfollowed successfully" : "Followed successfully");
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    }
  };

  const fetchUserCommunities = async () => {
    try {
      setCommunitiesLoading(true);
      const fullName = localStorage.getItem("username");
      const firstName = fullName.split(" ")[0]; // Get just first name
      const res = await api.get(`/communities/user-communities?userName=${encodeURIComponent(firstName)}`);
      
      setJoinedCommunities(res.data.map(community => ({
        ...community,
        id: community._id || community.id
      })));
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("Failed to load communities");
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setCommunitiesLoading(false);
    }
  };

  const handleSportChange = (selectedOption) => {
    setSelectedSport(selectedOption);
    setSelectedSkill(null); // Reset skill when sport changes
    
    if (selectedOption) {
      fetchSkillsForSport(selectedOption.value);
    } else {
      setAvailableSkills([]);
    }
  };

  const fetchSkillsForSport = async (sportValue) => {
    try {
      const response = await api.get(`/users/skills/${sportValue}`);
      const skills = response.data.map(skill => ({
        value: skill,
        label: skill
      }));
      setAvailableSkills(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Failed to load skills");
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (selectedSport && selectedSkill) {
      const newSkill = {
        sport: selectedSport.value,
        skillName: selectedSkill.value
      };
      
      // Check if skill already exists
      const skillExists = profileData.skills.some(
        skill => skill.sport === newSkill.sport && skill.skillName === newSkill.skillName
      );
      
      if (!skillExists) {
        setProfileData(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill]
        }));
        setSelectedSkill(null); // Clear selection after adding
      } else {
        toast.warning("This skill is already added");
      }
    } else {
      toast.warning("Please select both a sport and a skill");
    }
  };
  
  const handleRemoveSkill = (index) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await api.put("/users/profile", profileData);
      setProfileData(response.data);
      localStorage.setItem("username", response.data.username);
      setEditMode(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      setLoading(true);
      let res;
      
      if (editingPost) {
        // Update existing post
        res = await api.put(`/posts/${editingPost.id}`, newPost);
        setPosts(posts.map(post => 
          post.id === editingPost.id ? res.data : post
        ));
      } else {
        // Create new post
        res = await api.post("/posts", newPost);
        setPosts([res.data, ...posts]);
      }
      
      setNewPost({ title: "", content: "", image: "", isPublic: true });
      setEditingPost(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving post:", error);
      if (error.response?.status === 403) {
        setError("You don't have permission to update this post");
      } else {
        setError("Failed to save post. Please try again.");
      }
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (id, currentVisibility) => {
    try {
      const res = await api.put(`/posts/${id}/visibility`, { isPublic: !currentVisibility });
      setPosts(posts.map(post => 
        post.id === id ? { ...post, isPublic: res.data.isPublic } : post
      ));
    } catch (error) {
      console.error("Error updating visibility:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/posts/${id}`);
        setPosts(posts.filter(post => post.id !== id));
      } catch (error) {
        console.error("Error deleting post:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      image: post.image,
      isPublic: post.isPublic,
    });
    setShowModal(true);
  };

  const handleLeaveCommunity = async (communityId) => {
    if (window.confirm("Are you sure you want to leave this community?")) {
      try {
        const userName = localStorage.getItem("username");
        const encodedUserName = encodeURIComponent(userName);
        await api.post(`/communities/${communityId}/leave`, null, {
          params: { userName: encodedUserName }
        });
        await fetchUserCommunities();
        toast.success("You have left the community");
      } catch (error) {
        console.error("Error leaving community:", error);
        toast.error("Failed to leave community");
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8f4ff] to-[#eef2ff] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              {profileData.photoURL ? (
                <div className="relative group">
                  <img 
                    src={profileData.photoURL} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = null;
                      e.target.classList.add("bg-indigo-100");
                      e.target.classList.remove("object-cover");
                    }}
                  />
                  {profileData.isCurrentUser && (
                    <label 
                      htmlFor="profile-picture-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    >
                      <FaEdit className="text-white text-xl" />
                      <input
                        id="profile-picture-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-indigo-100 bg-indigo-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-600">
                      {profileData.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  {profileData.isCurrentUser && (
                    <label 
                      htmlFor="profile-picture-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    >
                      <FaEdit className="text-white text-xl" />
                      <input
                        id="profile-picture-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold text-gray-800">
                  {editMode ? (
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      className="border-b border-gray-300 focus:border-indigo-500 outline-none"
                    />
                  ) : (
                    profileData.username
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  {!profileData.isCurrentUser && (
                    <button 
                      onClick={handleFollowToggle}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                        isFollowing 
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      <FiUserPlus size={14} />
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                  {profileData.isCurrentUser && (
                    <button 
                      onClick={() => editMode ? handleProfileUpdate() : setEditMode(true)}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                    >
                      <FaEdit /> {editMode ? "Save" : "Edit"}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{profileData.email}</p>
              
              {/* Followers/Following Count */}
              <div className="flex gap-6 mb-4">
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                  onClick={() => navigate(`/users/${profileUserId}/followers`)}
                >
                  <FaUserFriends className="text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Followers</p>
                    <p className="text-lg font-semibold text-indigo-600">{profileData.followersCount}</p>
                  </div>
                </div>
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                  onClick={() => navigate(`/users/${profileUserId}/following`)}
                >
                  <FaUserFriends className="text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Following</p>
                    <p className="text-lg font-semibold text-indigo-600">{profileData.followingCount}</p>
                  </div>
                </div>
              </div>
              
              {/* User Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FaPhone className="text-indigo-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    {editMode ? (
                      <input
                        type="text"
                        value={profileData.phoneNo}
                        onChange={(e) => setProfileData({...profileData, phoneNo: e.target.value})}
                        className="border-b border-gray-300 focus:border-indigo-500 outline-none w-full"
                      />
                    ) : (
                      <p className="text-gray-800">{profileData.phoneNo || "Not provided"}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FaHome className="text-indigo-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    {editMode ? (
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        className="border-b border-gray-300 focus:border-indigo-500 outline-none w-full"
                      />
                    ) : (
                      <p className="text-gray-800">{profileData.address || "Not provided"}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FaGraduationCap className="text-indigo-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Education</p>
                    {editMode ? (
                      <input
                        type="text"
                        value={profileData.education}
                        onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                        className="border-b border-gray-300 focus:border-indigo-500 outline-none w-full"
                      />
                    ) : (
                      <p className="text-gray-800">{profileData.education || "Not provided"}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FaStar className="text-indigo-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Activity</p>
                    <div className="flex gap-4">
                      <span className="text-gray-800">{posts.length} {posts.length === 1 ? "Post" : "Posts"}</span>
                      <span className="text-gray-800">{joinedCommunities.length} {joinedCommunities.length === 1 ? "Community" : "Communities"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section - Updated with better UI */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
              {editMode && (
                <button 
                  onClick={() => setEditMode(false)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Done
                </button>
              )}
            </div>
            
            {editMode ? (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Food</label>
                    <Select
                      options={availableSports}
                      value={selectedSport}
                      onChange={handleSportChange}
                      placeholder="Select a Food"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                    <Select
                      options={availableSkills}
                      value={selectedSkill}
                      onChange={setSelectedSkill}
                      isDisabled={!selectedSport || skillsLoading}
                      placeholder={selectedSport ? "Select a skill" : "Select a food first"}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleAddSkill}
                      disabled={!selectedSkill}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add  Skill
                    </button>
                  </div>
                </div>
                
                {profileData.skills.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Your Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <div 
                          key={index} 
                          className="flex items-center bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full"
                        >
                          <span className="mr-2">
                            <span className="font-medium">{skill.sport}</span>: {skill.skillName}
                          </span>
                          <button
                            onClick={() => handleRemoveSkill(index)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {profileData.skills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileData.skills.map((skill, index) => (
                      <div 
                        key={index} 
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100 hover:shadow-md transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-indigo-100 text-indigo-800 p-2 rounded-full">
                            <FaStar className="text-sm" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{skill.sport}</h3>
                            <p className="text-indigo-600">{skill.skillName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <FaStar className="text-indigo-600 text-xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No skills added yet</h3>
                    <p className="text-gray-500 mb-4">Add your cooking skills to showcase your abilities</p>
                    <button 
                      onClick={() => setEditMode(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      Add Skills
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rest of your component (Communities and Posts sections) remains the same */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Communities */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Your Communities</h2>
                  <button 
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    See All
                  </button>
                </div>
                
                {communitiesLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : joinedCommunities.length > 0 ? (
                  <ul className="space-y-3">
                    {joinedCommunities.map((community) => (
                    <li 
                      key={community.id} 
                      className="group flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                      onClick={() => navigate(`/community/${community.id}`)}
                    >
                      <div className="bg-indigo-100 text-indigo-800 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                        {community.name?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{community.name || 'Unnamed Community'}</h3>
                        <p className="text-sm text-gray-500">
                          {community.members?.length || 0} member{community.members?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveCommunity(community._id || community.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 transition-opacity"
                        title="Leave Community"
                      >
                        <FaTimes />
                      </button>
                    </li>
                  ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">You haven't joined any communities yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Posts */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Your Posts</h2>
                  <button 
                    onClick={() => {
                      setEditingPost(null);
                      setNewPost({ title: "", content: "", image: "", isPublic: true });
                      setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <FaPlus /> New Post
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <FiEdit2 className="text-indigo-600 text-3xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No posts yet</h3>
                    <p className="text-gray-500 mb-4">Share your thoughts with the community</p>
                    <button 
                      onClick={() => setShowModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      Create Your First Post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div key={post.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition">
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                title="Edit Post"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleToggleVisibility(post.id, post.isPublic)}
                                className={`p-2 rounded-full ${post.isPublic ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}
                                title={post.isPublic ? "Make Private" : "Make Public"}
                              >
                                {post.isPublic ? <FaGlobe /> : <FaLock />}
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                                title="Delete Post"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 whitespace-pre-line">{post.content}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${post.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {post.isPublic ? "Public" : "Private"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* New Post Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurred backdrop */}
            <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30" onClick={() => {
              setShowModal(false);
              setEditingPost(null);
            }}></div>
            
            {/* Modal content */}
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-xl font-semibold">
                  {editingPost ? "Edit Post" : "Create New Post"}
                </h3>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setEditingPost(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handlePostSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="What's your post about?"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Content</label>
                  <textarea
                    rows="5"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your thoughts..."
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    value={newPost.image}
                    onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div className="mb-6 flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newPost.isPublic}
                    onChange={(e) => setNewPost({ ...newPost, isPublic: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-gray-700">
                    Make this post public
                  </label>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPost(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingPost ? "Updating..." : "Posting..."}
                      </>
                    ) : (
                      editingPost ? "Update Post" : "Post"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;