import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/project-context';

interface Photo {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  likes: number;
  category: string;
  tags: string[];
  photographer: string;
}

interface PhotoGalleryPreviewProps {
  className?: string;
}

/**
 * A photo gallery preview component with interactive features
 */
const PhotoGalleryPreview: React.FC<PhotoGalleryPreviewProps> = ({ className = '' }) => {
  const { currentProject } = useProject();
  
  // State for gallery data
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: 1,
      title: 'Mountain Sunrise',
      description: 'Beautiful sunrise over the mountains in the Himalayas',
      imageUrl: '🏔️',
      likes: 142,
      category: 'Landscape',
      tags: ['mountains', 'sunrise', 'nature'],
      photographer: 'Ananya Kapoor'
    },
    {
      id: 2,
      title: 'Coastal Waves',
      description: 'Waves crashing on the rocky coast of Kerala',
      imageUrl: '🌊',
      likes: 89,
      category: 'Seascape',
      tags: ['ocean', 'waves', 'coast'],
      photographer: 'Vikram Mehta'
    },
    {
      id: 3,
      title: 'Forest Wildlife',
      description: 'A tiger spotted in the forests of Madhya Pradesh',
      imageUrl: '🐯',
      likes: 213,
      category: 'Wildlife',
      tags: ['tiger', 'wildlife', 'forest'],
      photographer: 'Rahul Sharma'
    },
    {
      id: 4,
      title: 'Autumn Trees',
      description: 'Colorful autumn foliage in Shimla',
      imageUrl: '🍁',
      likes: 76,
      category: 'Landscape',
      tags: ['autumn', 'trees', 'colors'],
      photographer: 'Priya Singh'
    },
    {
      id: 5,
      title: 'Desert Sunset',
      description: 'Stunning sunset over the Thar Desert',
      imageUrl: '🌵',
      likes: 105,
      category: 'Landscape',
      tags: ['desert', 'sunset', 'dunes'],
      photographer: 'Arjun Patel'
    },
    {
      id: 6,
      title: 'Monsoon Beauty',
      description: 'Rainy season in the Western Ghats',
      imageUrl: '🌧️',
      likes: 67,
      category: 'Weather',
      tags: ['rain', 'monsoon', 'greenery'],
      photographer: 'Neha Gupta'
    }
  ]);
  
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Filter photos based on active category and search term
  const filteredPhotos = photos.filter(photo => {
    const matchesCategory = activeCategory === 'All' || photo.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });
  
  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(photos.map(photo => photo.category)))];
  
  // Handle liking a photo
  const handleLikePhoto = (id: number) => {
    if (likedPhotos.includes(id)) {
      // Unlike the photo
      setLikedPhotos(likedPhotos.filter(photoId => photoId !== id));
      setPhotos(photos.map(photo => 
        photo.id === id ? { ...photo, likes: photo.likes - 1 } : photo
      ));
    } else {
      // Like the photo
      setLikedPhotos([...likedPhotos, id]);
      setPhotos(photos.map(photo => 
        photo.id === id ? { ...photo, likes: photo.likes + 1 } : photo
      ));
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-full`}>
      <div className={`h-full bg-white dark:bg-gray-900 ${className}`}>
        {/* Header */}
        <header className="relative bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">
              {currentProject?.name || 'Nature Gallery'}
            </h1>
            <p className="text-white/80 max-w-xl">
              Explore the beauty of nature through our collection of stunning photographs
            </p>
            
            <div className="absolute top-4 right-4 flex items-center">
              <button 
                onClick={toggleDarkMode}
                className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>
        
        {/* Search and Filter Bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow p-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute left-3 top-2.5">🔍</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    activeCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Gallery */}
        <main className="p-4 max-w-5xl mx-auto">
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold mb-2">No photos found</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotos.map(photo => (
                <div 
                  key={photo.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div 
                    className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <span className="text-6xl">{photo.imageUrl}</span>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg mb-1">{photo.title}</h3>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full">
                        {photo.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {photo.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {photo.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        By {photo.photographer}
                      </span>
                      
                      <button 
                        onClick={() => handleLikePhoto(photo.id)}
                        className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <span className={likedPhotos.includes(photo.id) ? 'text-red-600 dark:text-red-400' : ''}>
                          {likedPhotos.includes(photo.id) ? '❤️' : '🤍'}
                        </span>
                        {photo.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        
        {/* Photo Detail Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col">
              <div className="relative h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-9xl">{selectedPhoto.imageUrl}</span>
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  ✖️
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedPhoto.title}</h2>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                    {selectedPhoto.category}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {selectedPhoto.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPhoto.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Photographer</p>
                    <p className="font-medium">{selectedPhoto.photographer}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleLikePhoto(selectedPhoto.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  >
                    <span className={likedPhotos.includes(selectedPhoto.id) ? 'text-red-600 dark:text-red-400' : ''}>
                      {likedPhotos.includes(selectedPhoto.id) ? '❤️' : '🤍'}
                    </span>
                    <span>{selectedPhoto.likes} likes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <footer className="bg-gray-100 dark:bg-gray-800 p-6 mt-8">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Created with Xalgrow AI Coding Assistant
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export { PhotoGalleryPreview };