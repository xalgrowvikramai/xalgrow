import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/project-context';

interface Location {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface Driver {
  id: number;
  name: string;
  rating: number;
  vehicleType: string;
  vehicleNumber: string;
  avatar: string;
  distance: number; // in km
  eta: number; // in minutes
}

interface Ride {
  id: number;
  pickupLocation: Location;
  dropLocation: Location;
  driver?: Driver;
  status: 'searching' | 'confirmed' | 'arriving' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  distance: number; // in km
  duration: number; // in minutes
  timestamp: Date;
}

interface RideSharingPreviewProps {
  className?: string;
}

/**
 * A ride-sharing app preview component with interactive features
 */
const RideSharingPreview: React.FC<RideSharingPreviewProps> = ({ className = '' }) => {
  const { currentProject } = useProject();

  const [appName, setAppName] = useState<string>('Ola');
  const [selectedTab, setSelectedTab] = useState<'ride' | 'food' | 'rentals' | 'activity'>('ride');
  const [viewState, setViewState] = useState<'home' | 'searching' | 'driver_found' | 'arriving' | 'ride' | 'completed'>('home');
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [rideType, setRideType] = useState<'auto' | 'mini' | 'sedan' | 'suv' | 'premium'>('auto');
  const [pickupLocation, setPickupLocation] = useState<Location>({
    id: 1,
    name: 'Current Location',
    address: '42 Park Street, Kolkata',
    latitude: 22.555,
    longitude: 88.345
  });
  
  const [dropLocation, setDropLocation] = useState<Location>({
    id: 2,
    name: 'Office',
    address: 'Sector V, Salt Lake, Kolkata',
    latitude: 22.569,
    longitude: 88.429
  });
  
  const [savedLocations, setSavedLocations] = useState<Location[]>([
    {
      id: 2,
      name: 'Office',
      address: 'Sector V, Salt Lake, Kolkata',
      latitude: 22.569,
      longitude: 88.429
    },
    {
      id: 3,
      name: 'Home',
      address: 'New Town, Kolkata',
      latitude: 22.623,
      longitude: 88.447
    },
    {
      id: 4,
      name: 'Mall',
      address: 'South City Mall, Prince Anwar Shah Road',
      latitude: 22.498,
      longitude: 88.368
    }
  ]);
  
  const [priceEstimates, setPriceEstimates] = useState({
    auto: 120,
    mini: 160,
    sedan: 210,
    suv: 250,
    premium: 350
  });
  
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([
    {
      id: 1,
      name: 'Rahul Sharma',
      rating: 4.8,
      vehicleType: 'auto',
      vehicleNumber: 'WB 04 AB 1234',
      avatar: '👨‍🦰',
      distance: 1.2,
      eta: 4
    },
    {
      id: 2,
      name: 'Priya Patel',
      rating: 4.9,
      vehicleType: 'mini',
      vehicleNumber: 'WB 05 CD 5678',
      avatar: '👩',
      distance: 0.8,
      eta: 3
    },
    {
      id: 3,
      name: 'Amir Khan',
      rating: 4.7,
      vehicleType: 'sedan',
      vehicleNumber: 'WB 06 EF 9012',
      avatar: '👨',
      distance: 1.5,
      eta: 5
    },
    {
      id: 4,
      name: 'Sanjay Gupta',
      rating: 4.6,
      vehicleType: 'suv',
      vehicleNumber: 'WB 07 GH 3456',
      avatar: '👨‍🦱',
      distance: 2.1,
      eta: 7
    },
    {
      id: 5,
      name: 'Lakshmi Nair',
      rating: 4.9,
      vehicleType: 'premium',
      vehicleNumber: 'WB 08 IJ 7890',
      avatar: '👩‍🦱',
      distance: 3.2,
      eta: 9
    }
  ]);
  
  // Set app name from project name if available
  useEffect(() => {
    if (currentProject && currentProject.name) {
      const name = currentProject.name.trim();
      if (name.toLowerCase().includes('ola')) {
        setAppName('Ola');
      } else if (name.toLowerCase().includes('uber')) {
        setAppName('Uber');
      } else {
        // Use a simplified version of the project name or default to "Rideshare"
        const simpleName = name.split(' ')[0];
        setAppName(simpleName || 'Rideshare');
      }
    }
  }, [currentProject]);
  
  // Book a ride
  const handleBookRide = () => {
    // Calculate ride details
    const distance = Math.round((Math.random() * 5 + 5) * 10) / 10; // 5-10 km
    const duration = Math.round(distance * 3); // 3 min per km
    const price = priceEstimates[rideType];
    
    // Create new ride
    const newRide: Ride = {
      id: Date.now(),
      pickupLocation,
      dropLocation,
      status: 'searching',
      price,
      distance,
      duration,
      timestamp: new Date()
    };
    
    setCurrentRide(newRide);
    setViewState('searching');
    
    // Simulate finding a driver
    setTimeout(() => {
      // Find a driver matching the requested ride type
      const availableDrivers = nearbyDrivers.filter(d => d.vehicleType === rideType);
      const driver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
      
      setCurrentRide(prev => prev ? { ...prev, driver, status: 'confirmed' } : null);
      setViewState('driver_found');
    }, 3000);
  };
  
  // Cancel ride
  const handleCancelRide = () => {
    setCurrentRide(prev => prev ? { ...prev, status: 'cancelled' } : null);
    setViewState('home');
  };
  
  // Start ride
  const handleStartRide = () => {
    setCurrentRide(prev => prev ? { ...prev, status: 'in_progress' } : null);
    setViewState('ride');
    
    // Simulate ride completion
    setTimeout(() => {
      setCurrentRide(prev => prev ? { ...prev, status: 'completed' } : null);
      setViewState('completed');
    }, 5000);
  };
  
  // Finish ride and go back to home
  const handleFinishRide = () => {
    setCurrentRide(null);
    setViewState('home');
  };
  
  // Render different states of the app
  const renderContent = () => {
    switch (viewState) {
      case 'home':
        return (
          <div className="bg-gray-100 dark:bg-gray-900 flex-1 overflow-auto">
            {/* Search Bar */}
            <div className="p-4 bg-white dark:bg-gray-800 shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                  👤
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Hi there!</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Where are you going today?</p>
                </div>
              </div>
              
              <div className="relative mb-3">
                <div className="absolute left-3 top-3 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>
                
                <div className="ml-10">
                  <div className="mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{pickupLocation.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{pickupLocation.address}</p>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{dropLocation.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dropLocation.address}</p>
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                onClick={handleBookRide}
              >
                Book {rideType.toUpperCase()}
              </button>
            </div>
            
            {/* Ride Options */}
            <div className="px-4 pt-4">
              <h3 className="font-semibold mb-3">Choose Ride Type</h3>
              <div className="flex overflow-x-auto pb-2 gap-3">
                <button 
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg ${rideType === 'auto' ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' : 'bg-white dark:bg-gray-800'}`}
                  onClick={() => setRideType('auto')}
                >
                  <span className="text-2xl mb-1">🛺</span>
                  <span className="font-medium">Auto</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">₹{priceEstimates.auto}</span>
                </button>
                
                <button 
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg ${rideType === 'mini' ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' : 'bg-white dark:bg-gray-800'}`}
                  onClick={() => setRideType('mini')}
                >
                  <span className="text-2xl mb-1">🚗</span>
                  <span className="font-medium">Mini</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">₹{priceEstimates.mini}</span>
                </button>
                
                <button 
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg ${rideType === 'sedan' ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' : 'bg-white dark:bg-gray-800'}`}
                  onClick={() => setRideType('sedan')}
                >
                  <span className="text-2xl mb-1">🚕</span>
                  <span className="font-medium">Sedan</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">₹{priceEstimates.sedan}</span>
                </button>
                
                <button 
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg ${rideType === 'suv' ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' : 'bg-white dark:bg-gray-800'}`}
                  onClick={() => setRideType('suv')}
                >
                  <span className="text-2xl mb-1">🚙</span>
                  <span className="font-medium">SUV</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">₹{priceEstimates.suv}</span>
                </button>
                
                <button 
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg ${rideType === 'premium' ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' : 'bg-white dark:bg-gray-800'}`}
                  onClick={() => setRideType('premium')}
                >
                  <span className="text-2xl mb-1">🚘</span>
                  <span className="font-medium">Premium</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">₹{priceEstimates.premium}</span>
                </button>
              </div>
            </div>
            
            {/* Saved Locations */}
            <div className="p-4">
              <h3 className="font-semibold mb-3">Saved Places</h3>
              <div className="space-y-3">
                {savedLocations.map(location => (
                  <div 
                    key={location.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center shadow-sm"
                    onClick={() => setDropLocation(location)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                      {location.name === 'Home' ? '🏠' : location.name === 'Office' ? '🏢' : '📍'}
                    </div>
                    <div>
                      <h4 className="font-medium">{location.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{location.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Rides */}
            <div className="p-4">
              <h3 className="font-semibold mb-3">Recent Rides</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                  🕒
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Office</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Yesterday, 9:30 AM</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">₹180</div>
              </div>
            </div>
          </div>
        );
        
      case 'searching':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-bold mb-2">Finding your ride...</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Looking for drivers nearby</p>
            <button 
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              onClick={handleCancelRide}
            >
              Cancel
            </button>
          </div>
        );
        
      case 'driver_found':
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-4 bg-white dark:bg-gray-800 shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Driver Found!</h2>
                <span className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                  {currentRide?.driver?.eta} mins away
                </span>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl mr-4">
                  {currentRide?.driver?.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{currentRide?.driver?.name}</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span>{currentRide?.driver?.rating}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentRide?.driver?.vehicleType.toUpperCase()} • {currentRide?.driver?.vehicleNumber}
                  </div>
                </div>
              </div>
              
              <div className="relative mb-4">
                <div className="absolute left-3 top-3 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>
                
                <div className="ml-10">
                  <div className="mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{pickupLocation.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{pickupLocation.address}</p>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{dropLocation.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dropLocation.address}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 py-3 rounded-lg font-medium">
                  <span>📞</span> Call
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 py-3 rounded-lg font-medium">
                  <span>💬</span> Chat
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg font-medium"
                  onClick={handleCancelRide}
                >
                  <span>✖️</span> Cancel
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-2">Ride Details</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Distance</span>
                  <span>{currentRide?.distance} km</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Time</span>
                  <span>{currentRide?.duration} mins</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                  <span>Cash</span>
                </div>
                <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total Fare</span>
                  <span>₹{currentRide?.price}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <button 
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                onClick={handleStartRide}
              >
                Start Ride
              </button>
            </div>
          </div>
        );
        
      case 'ride':
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-4 bg-white dark:bg-gray-800 shadow">
              <h2 className="text-lg font-bold mb-4">Enjoy your ride!</h2>
              
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg mb-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center mr-3">
                  🚕
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">On the way to destination</h4>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl mr-3">
                  {currentRide?.driver?.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{currentRide?.driver?.name}</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentRide?.driver?.vehicleNumber}
                  </div>
                </div>
                <button className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  📞
                </button>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Estimated arrival</span>
                  <span className="font-medium">8 mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total distance</span>
                  <span className="font-medium">{currentRide?.distance} km</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Safety Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center">
                    <span className="text-2xl mr-2">👮</span>
                    <span>Emergency</span>
                  </button>
                  <button className="bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center">
                    <span className="text-2xl mr-2">👥</span>
                    <span>Share Trip</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
                <h3 className="font-semibold mb-2">Ride Details</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Pick-up</span>
                  <span>{pickupLocation.name}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Drop-off</span>
                  <span>{dropLocation.name}</span>
                </div>
                <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total Fare</span>
                  <span>₹{currentRide?.price}</span>
                </div>
              </div>
              
              <button 
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                onClick={() => setViewState('completed')}
              >
                Complete Ride
              </button>
            </div>
          </div>
        );
        
      case 'completed':
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-6 bg-white dark:bg-gray-800 shadow">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-2xl mx-auto mb-4">
                  ✅
                </div>
                <h2 className="text-xl font-bold mb-1">Ride Completed</h2>
                <p className="text-gray-600 dark:text-gray-400">Thank you for riding with {appName}!</p>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Total Fare</span>
                  <span className="font-bold text-lg">₹{currentRide?.price}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                  <span>Cash</span>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                  You saved ₹25 with this ride!
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Rate your ride</h3>
                <div className="flex justify-center space-x-2 mb-4">
                  <button className="text-2xl text-yellow-500">⭐</button>
                  <button className="text-2xl text-yellow-500">⭐</button>
                  <button className="text-2xl text-yellow-500">⭐</button>
                  <button className="text-2xl text-yellow-500">⭐</button>
                  <button className="text-2xl text-gray-300 dark:text-gray-600">⭐</button>
                </div>
                <textarea 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Any comments about your trip?"
                  rows={3}
                ></textarea>
              </div>
              
              <button 
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                onClick={handleFinishRide}
              >
                Back to Home
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={`bg-gray-100 dark:bg-gray-900 h-full overflow-hidden flex flex-col ${className}`}>
      {/* App Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{appName}</h1>
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-blue-700 rounded-full">🎁</span>
            <span className="p-2 bg-blue-700 rounded-full">⚙️</span>
          </div>
        </div>
        
        {viewState === 'home' && (
          <div className="mt-4 flex justify-between">
            <button 
              className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTab === 'ride' ? 'bg-white text-blue-600' : 'bg-transparent'}`}
              onClick={() => setSelectedTab('ride')}
            >
              Ride
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTab === 'food' ? 'bg-white text-blue-600' : 'bg-transparent'}`}
              onClick={() => setSelectedTab('food')}
            >
              Food
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTab === 'rentals' ? 'bg-white text-blue-600' : 'bg-transparent'}`}
              onClick={() => setSelectedTab('rentals')}
            >
              Rentals
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTab === 'activity' ? 'bg-white text-blue-600' : 'bg-transparent'}`}
              onClick={() => setSelectedTab('activity')}
            >
              Activity
            </button>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      {renderContent()}
      
      {/* Bottom Navigation - Only show on home screen */}
      {viewState === 'home' && (
        <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2">
          <div className="flex justify-around">
            <button className="p-2 flex flex-col items-center">
              <span className="text-blue-600 dark:text-blue-400 text-xl mb-1">🏠</span>
              <span className="text-xs">Home</span>
            </button>
            <button className="p-2 flex flex-col items-center">
              <span className="text-gray-500 dark:text-gray-400 text-xl mb-1">📊</span>
              <span className="text-xs">Activity</span>
            </button>
            <button className="p-2 flex flex-col items-center">
              <span className="text-gray-500 dark:text-gray-400 text-xl mb-1">🎁</span>
              <span className="text-xs">Rewards</span>
            </button>
            <button className="p-2 flex flex-col items-center">
              <span className="text-gray-500 dark:text-gray-400 text-xl mb-1">👤</span>
              <span className="text-xs">Account</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export { RideSharingPreview };