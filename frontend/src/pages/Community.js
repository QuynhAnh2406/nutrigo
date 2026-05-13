import React, { useState, useEffect, useCallback } from 'react';
import PostCard from '../components/PostCard';
import PostDetailModal from '../components/PostDetailModal';
import AddToMealPlanModal from '../components/AddToMealPlanModal';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('For You');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToAddPlan, setPostToAddPlan] = useState(null);

  const tabs = ['For You', 'Latest', 'My Meals', 'Following', 'Popular'];
  const filters = ['All', 'Low Calorie', 'High Protein', 'Low Carb', 'Vegetarian', 'Keto', 'Under 15 mins', 'Under 30 mins'];


  const fetchPosts = useCallback(async () => {
    try {
      let url = `http://localhost:5000/api/posts?tab=${activeTab}&filter=${activeFilter}&search=${searchQuery}`;
      const res = await fetch(url);
      const data = await res.json();
      if(data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [activeTab, activeFilter, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);


  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, { method: 'POST' });
      const data = await res.json();
      if(data.success) {
        setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: data.isLiked, likes: data.likes } : p));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSave = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/favorite`, { method: 'POST' });
      const data = await res.json();
      if(data.success) {
        setPosts(posts.map(p => p.id === postId ? { ...p, isSaved: data.isSaved } : p));
      }
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  return (
    <div className="community-page main-content">
      <div className="mb-8">
        <PageHeader
          title="HealthyLife Community"
          subtitle="Discover recipes, save favourites, and add meals to your weekly plan."
          icon={Users}
          badge={`${posts.length} meals`}
          actions={
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-black"
              onClick={() => navigate('/community/create-post')}
            >
              <Plus className="h-4 w-4" />
              Post New Meal
            </button>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Smart search (dish name, ingredients, calories...)"
                className="w-full rounded-2xl border border-white/70 bg-white/70 py-3 pl-12 pr-4 text-sm font-semibold text-gray-900 placeholder:text-gray-500 outline-none ring-0 backdrop-blur focus:border-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`rounded-full px-3 py-1.5 text-xs font-extrabold ring-1 transition-colors ${
                    activeFilter === filter
                      ? 'bg-gray-900 text-white ring-gray-900'
                      : 'bg-white/70 text-gray-800 ring-white/70 hover:bg-white'
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </PageHeader>
      </div>

      {/* TABS */}
      <div className="community-tabs">
        {tabs.map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* FEED */}
      <div className="feed-container">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={handleLike}
              onSave={handleSave}
              onOpenDetail={(p) => setSelectedPost(p)}
              onAddToPlan={(p) => setPostToAddPlan(p)}
            />
          ))
        ) : (
          <div className="empty-state">No meals found.</div>
        )}
      </div>

      {/* MODALS */}

      {selectedPost && (
        <PostDetailModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}

      {postToAddPlan && (
        <AddToMealPlanModal 
          post={postToAddPlan} 
          onClose={() => setPostToAddPlan(null)} 
        />
      )}
    </div>
  );
}

export default Community;
