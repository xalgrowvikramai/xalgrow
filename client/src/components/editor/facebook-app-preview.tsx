import React, { useState, useEffect } from 'react';
import { useEditor } from '@/contexts/editor-context';
import { useProject } from '@/contexts/project-context';

interface User {
  id: number;
  name: string;
  photo: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
}

interface Post {
  id: number;
  userId: number;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: Date;
}

interface FacebookAppPreviewProps {
  className?: string;
}

/**
 * A component that provides a fully interactive preview of a Facebook-like dating app
 * with real state management and event handling.
 */
const FacebookAppPreview: React.FC<FacebookAppPreviewProps> = ({ className = '' }) => {
  const { currentProject } = useProject();
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'Alex Johnson',
    photo: '👤',
    age: 28,
    location: 'Mumbai, India',
    bio: 'Love traveling and photography',
    interests: ['Photography', 'Travel', 'Cooking', 'Hiking']
  });
  
  const [users, setUsers] = useState<User[]>([
    {
      id: 2,
      name: 'Priya Sharma',
      photo: '👩',
      age: 26,
      location: 'Delhi, India',
      bio: 'Creative soul, love art and music',
      interests: ['Art', 'Music', 'Dance', 'Reading']
    },
    {
      id: 3,
      name: 'Rahul Patel',
      photo: '👨',
      age: 30,
      location: 'Bangalore, India',
      bio: 'Tech enthusiast and coffee lover',
      interests: ['Technology', 'Coffee', 'Movies', 'Fitness']
    },
    {
      id: 4,
      name: 'Ananya Gupta',
      photo: '👧',
      age: 24,
      location: 'Chennai, India',
      bio: 'Passionate about psychology and design',
      interests: ['Psychology', 'Design', 'Yoga', 'Painting']
    }
  ]);
  
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      userId: 2,
      content: 'Just finished a beautiful art project. So excited to share!',
      likes: 45,
      comments: 12,
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
    },
    {
      id: 2,
      userId: 3,
      content: 'Check out this amazing new coffee place in Bangalore!',
      likes: 32,
      comments: 8,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: 3,
      userId: 1,
      content: 'Just uploaded some new travel photos from my trip to Kerala',
      likes: 78,
      comments: 23,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    }
  ]);
  
  const [activeTab, setActiveTab] = useState<'home' | 'matches' | 'messages' | 'profile'>('home');
  const [postContent, setPostContent] = useState('');
  const [likedUsers, setLikedUsers] = useState<number[]>([]);
  const [matches, setMatches] = useState<number[]>([2]); // Default match with Priya
  
  // Add a new post
  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    
    const newPost: Post = {
      id: Date.now(),
      userId: currentUser.id,
      content: postContent,
      likes: 0,
      comments: 0,
      timestamp: new Date()
    };
    
    setPosts([newPost, ...posts]);
    setPostContent('');
  };
  
  // Like a post
  const handleLikePost = (id: number) => {
    setPosts(
      posts.map(post =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };
  
  // Like a user profile (swipe right)
  const handleLikeUser = (id: number) => {
    if (!likedUsers.includes(id)) {
      setLikedUsers([...likedUsers, id]);
      
      // Simulate a match (50% chance)
      if (Math.random() > 0.5 && !matches.includes(id)) {
        setMatches([...matches, id]);
        alert(`Congratulations! You matched with ${users.find(u => u.id === id)?.name}!`);
      }
    }
  };
  
  // Function to format time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    
    if (diffSec < 60) return `${diffSec} sec ago`;
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    return date.toLocaleDateString();
  };
  
  // Get user by ID
  const getUserById = (id: number) => {
    if (id === currentUser.id) return currentUser;
    return users.find(user => user.id === id) || currentUser;
  };
  
  // Render different tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <form onSubmit={handleAddPost}>
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3">{currentUser.photo}</div>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white min-h-[60px]"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button type="button" className="px-3 py-1 text-gray-600 dark:text-gray-300 flex items-center rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <span className="mr-1">📷</span> Photo
                    </button>
                    <button type="button" className="px-3 py-1 text-gray-600 dark:text-gray-300 flex items-center rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <span className="mr-1">😊</span> Feeling
                    </button>
                  </div>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                    disabled={!postContent.trim()}
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
            
            {posts.map(post => {
              const user = getUserById(post.userId);
              return (
                <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="text-3xl mr-3">{user.photo}</div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(post.timestamp)}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4">{post.content}</p>
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                      <span>{post.likes} likes • {post.comments} comments</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className="flex-1 flex items-center justify-center py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <span className="mr-1">❤️</span> Like
                    </button>
                    <button className="flex-1 flex items-center justify-center py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <span className="mr-1">💬</span> Comment
                    </button>
                    <button className="flex-1 flex items-center justify-center py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <span className="mr-1">🔄</span> Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
        
      case 'matches':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Find Your Match</h2>
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 relative">
                  <div className="flex">
                    <div className="text-6xl mr-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 h-24 w-24 rounded-lg">
                      {user.photo}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{user.name}, {user.age}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{user.location}</p>
                      <p className="mb-2">{user.bio}</p>
                      <div className="flex flex-wrap gap-1">
                        {user.interests.map((interest, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-center space-x-4">
                    <button className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300">
                      ✖️
                    </button>
                    <button 
                      onClick={() => handleLikeUser(user.id)}
                      className={`w-12 h-12 flex items-center justify-center rounded-full ${
                        likedUsers.includes(user.id) 
                          ? 'bg-green-500 text-white' 
                          : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                      }`}
                    >
                      ❤️
                    </button>
                  </div>
                  
                  {matches.includes(user.id) && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100 text-xs rounded-full">
                      Match! 🎉
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'messages':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Messages</h2>
            {matches.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                <div className="text-5xl mb-3">💌</div>
                <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start finding matches to begin chatting!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map(id => {
                  const user = getUserById(id);
                  return (
                    <div key={id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 flex items-center">
                      <div className="text-3xl mr-3">{user.photo}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          Tap to start chatting!
                        </p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
        
      case 'profile':
        return (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <div className="p-4 flex flex-col items-center -mt-16">
                <div className="text-6xl bg-white dark:bg-gray-700 p-4 rounded-full border-4 border-white dark:border-gray-800 shadow">
                  {currentUser.photo}
                </div>
                <h2 className="text-2xl font-bold mt-2">{currentUser.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{currentUser.location}</p>
                
                <div className="mt-6 w-full">
                  <h3 className="text-lg font-semibold mb-2">About Me</h3>
                  <p className="mb-4">{currentUser.bio}</p>
                  
                  <h3 className="text-lg font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {currentUser.interests.map((interest, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded">
                        {interest}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="font-bold text-xl">{posts.filter(p => p.userId === currentUser.id).length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Posts</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl">{matches.length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Matches</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl">{likedUsers.length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Likes Sent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">My Posts</h3>
              {posts
                .filter(post => post.userId === currentUser.id)
                .map(post => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="text-2xl mr-2">{currentUser.photo}</div>
                        <div>
                          <h4 className="font-medium">{currentUser.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(post.timestamp)}
                          </p>
                        </div>
                      </div>
                      <button className="text-gray-500">•••</button>
                    </div>
                    <p className="my-2">{post.content}</p>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {post.likes} likes • {post.comments} comments
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={`bg-gray-100 dark:bg-gray-900 h-full overflow-auto ${className}`}>
      <div className="max-w-lg mx-auto p-4">
        <header className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow mb-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {currentProject?.name || 'Maniax'}
            </h1>
            <div className="flex space-x-3">
              <button className="p-2 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                🔍
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                🔔
              </button>
            </div>
          </div>
        </header>
        
        <main className="mb-16">
          {renderTabContent()}
        </main>
        
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 shadow-lg">
          <div className="max-w-lg mx-auto flex justify-around">
            <button 
              onClick={() => setActiveTab('home')}
              className={`p-2 rounded-full ${activeTab === 'home' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <div className="text-2xl mb-1">🏠</div>
              <span className="text-xs">Home</span>
            </button>
            <button 
              onClick={() => setActiveTab('matches')}
              className={`p-2 rounded-full ${activeTab === 'matches' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <div className="text-2xl mb-1">❤️</div>
              <span className="text-xs">Matches</span>
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`p-2 rounded-full ${activeTab === 'messages' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <div className="text-2xl mb-1">💬</div>
              <span className="text-xs">Messages</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`p-2 rounded-full ${activeTab === 'profile' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <div className="text-2xl mb-1">👤</div>
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export { FacebookAppPreview };