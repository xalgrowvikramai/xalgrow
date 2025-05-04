import React, { useState, useEffect } from 'react';
import { useEditor } from '@/contexts/editor-context';
import { useProject } from '@/contexts/project-context';

interface StandalonePreviewProps {
  className?: string;
}

/**
 * A direct React component preview that doesn't use iframes.
 */
const StandalonePreview: React.FC<StandalonePreviewProps> = ({ className = '' }) => {
  const { activeFile, activeFileContent } = useEditor();
  const { currentProject, projectFiles } = useProject();
  const [error, setError] = useState<string | null>(null);
  const [cssContent, setCssContent] = useState<string>('');

  // Find and load CSS files when project files change
  useEffect(() => {
    if (!projectFiles) return;
    
    // Look for CSS files
    const cssFiles = projectFiles.filter(file => file.name.endsWith('.css'));
    if (cssFiles.length > 0) {
      const combinedCss = cssFiles.map(file => file.content).join('\n');
      setCssContent(combinedCss);
    }
  }, [projectFiles]);

  // E-commerce Dashboard Demo Component
  const EcommerceDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    const salesData = [
      { month: 'Jan', sales: 1200 },
      { month: 'Feb', sales: 1900 },
      { month: 'Mar', sales: 1500 },
      { month: 'Apr', sales: 2200 },
      { month: 'May', sales: 2800 },
      { month: 'Jun', sales: 3100 }
    ];
    
    const recentOrders = [
      { id: '#ORD-1234', customer: 'John Doe', date: '2025-05-04', amount: 129.99, status: 'Delivered' },
      { id: '#ORD-1235', customer: 'Jane Smith', date: '2025-05-03', amount: 79.99, status: 'Processing' },
      { id: '#ORD-1236', customer: 'Robert Johnson', date: '2025-05-02', amount: 249.50, status: 'Shipped' },
      { id: '#ORD-1237', customer: 'Emily Davis', date: '2025-05-01', amount: 349.99, status: 'Delivered' },
    ];
    
    const products = [
      { id: 1, name: 'Premium Headphones', stock: 24, price: 129.99, category: 'Electronics' },
      { id: 2, name: 'Wireless Keyboard', stock: 15, price: 59.99, category: 'Accessories' },
      { id: 3, name: 'Designer T-Shirt', stock: 36, price: 29.99, category: 'Clothing' },
      { id: 4, name: 'Yoga Mat', stock: 18, price: 24.99, category: 'Fitness' },
    ];
    
    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real app, this would send data to an API
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        setFormData({ name: '', email: '', phone: '' });
      }, 3000);
    };
    
    // Filter products by search query
    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Confirmation message component
    const ConfirmationMessage = () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-xl font-bold mb-2">Success!</h3>
          <p className="mb-4">Your information has been submitted successfully.</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => setShowConfirmation(false)}
          >
            Close
          </button>
        </div>
      </div>
    );
    
    return (
      <div className="w-full h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Custom style for the preview */}
        <style>{`
          .preview-container {
            font-family: 'Inter', sans-serif;
            overflow-y: auto;
            max-height: 100%;
          }
          .stat-card {
            transition: all 0.2s ease;
          }
          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          .grid-item {
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            background: white;
          }
          .dark .grid-item {
            background: #1f2937;
          }
          .chart-bar {
            height: 150px;
            display: flex;
            align-items: flex-end;
            margin-top: 1rem;
          }
          .bar {
            flex: 1;
            margin: 0 3px;
            transition: height 0.3s ease;
            border-radius: 4px 4px 0 0;
            min-width: 20px;
            background-color: #3b82f6;
          }
          .dark .bar {
            background-color: #60a5fa;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .dark th, .dark td {
            border-bottom: 1px solid #374151;
          }
          th {
            font-weight: 600;
            color: #6b7280;
          }
          .status-delivered {
            color: #10b981;
            background-color: #d1fae5;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 0.75rem;
          }
          .status-processing {
            color: #f59e0b;
            background-color: #fef3c7;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 0.75rem;
          }
          .status-shipped {
            color: #3b82f6;
            background-color: #dbeafe;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 0.75rem;
          }
          .nav-button {
            padding: 0.5rem 1rem;
            margin-right: 0.5rem;
            border-radius: 0.375rem;
            font-weight: 500;
            transition: background-color 0.2s;
          }
          .nav-button.active {
            background-color: #3b82f6;
            color: white;
          }
          .nav-button:not(.active) {
            background-color: transparent;
            color: #6b7280;
          }
          .dark .nav-button:not(.active) {
            color: #9ca3af;
          }
          
          .input-field {
            margin-bottom: 1rem;
            width: 100%;
          }
          
          .input-field input {
            padding: 0.5rem;
            width: 100%;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
          }
          
          .dark .input-field input {
            background-color: #1f2937;
            border-color: #374151;
            color: #f3f4f6;
          }
        `}</style>
        
        <div className="preview-container p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {currentProject?.name || 'E-commerce Dashboard'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
          
          {/* Navigation */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
            <button 
              className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-button ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
            <button 
              className={`nav-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            <button 
              className={`nav-button ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              Customers
            </button>
          </div>
          
          {activeTab === 'dashboard' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="stat-card grid-item">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Total Sales</p>
                      <h3 className="text-2xl font-bold mt-1">₹12,456</h3>
                      <p className="text-green-500 text-sm mt-1">
                        ↑ 12% since last month
                      </p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card grid-item">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Orders</p>
                      <h3 className="text-2xl font-bold mt-1">256</h3>
                      <p className="text-green-500 text-sm mt-1">
                        ↑ 8% since last month
                      </p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card grid-item">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Customers</p>
                      <h3 className="text-2xl font-bold mt-1">1,843</h3>
                      <p className="text-green-500 text-sm mt-1">
                        ↑ 5% since last month
                      </p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card grid-item">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Conversion Rate</p>
                      <h3 className="text-2xl font-bold mt-1">3.42%</h3>
                      <p className="text-red-500 text-sm mt-1">
                        ↓ 1% since last month
                      </p>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sales Chart */}
              <div className="grid-item mb-6">
                <h3 className="text-lg font-semibold mb-2">Sales Overview</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Monthly sales performance</p>
                
                <div className="chart-bar">
                  {salesData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="bar" 
                        style={{ height: `${item.sales / 35}px` }}
                      ></div>
                      <span className="text-xs mt-2 text-gray-500">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recent Orders */}
              <div className="grid-item">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Orders</h3>
                  <button className="text-blue-500 text-sm">View All</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, index) => (
                        <tr key={index}>
                          <td>{order.id}</td>
                          <td>{order.customer}</td>
                          <td>{order.date}</td>
                          <td>₹{order.amount.toFixed(2)}</td>
                          <td>
                            <span className={`status-${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'products' && (
            <div className="grid-item">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Product Inventory</h2>
                <button 
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    // Show a toast-like notification
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 2000);
                  }}
                >
                  + Add Product
                </button>
              </div>
              
              <div className="mb-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search products by name or category..." 
                    className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg className="w-4 h-4 absolute left-2 top-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button 
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setSearchQuery('')}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.stock} units</td>
                          <td>₹{product.price.toFixed(2)}</td>
                          <td>{product.category}</td>
                          <td className="space-x-2">
                            <button 
                              className="text-blue-500 hover:underline"
                              onClick={() => {
                                setShowNotification(true);
                                setTimeout(() => setShowNotification(false), 2000);
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="text-red-500 hover:underline"
                              onClick={() => {
                                setShowNotification(true);
                                setTimeout(() => setShowNotification(false), 2000);
                              }}
                            >
                              Delete
                            </button>
                            <button 
                              className="text-green-500 hover:underline"
                              onClick={() => addToCart(product.id, product.name, product.price)}
                            >
                              Add to Cart
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          No products found matching "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="grid-item">
              <h2 className="text-lg font-semibold mb-4">Order Management</h2>
              <div className="mb-4 flex items-center">
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-l w-64 dark:bg-gray-700 dark:text-gray-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  className="bg-blue-500 text-white px-3 py-2 rounded-r hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 2000);
                  }}
                >
                  Search
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, index) => (
                      <tr key={index}>
                        <td>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.date}</td>
                        <td>₹{order.amount.toFixed(2)}</td>
                        <td>
                          <span className={`status-${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="text-blue-500 mr-1 hover:underline"
                            onClick={() => {
                              setShowNotification(true);
                              setTimeout(() => setShowNotification(false), 2000);
                            }}
                          >
                            View
                          </button>
                          <button 
                            className="text-green-500 hover:underline"
                            onClick={() => {
                              setShowNotification(true);
                              setTimeout(() => setShowNotification(false), 2000);
                            }}
                          >
                            Process
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'customers' && (
            <div className="grid-item">
              <h2 className="text-lg font-semibold mb-4">Customer Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium mb-3">Add New Customer</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="input-field">
                      <label className="block text-sm mb-1">Name</label>
                      <input 
                        type="text" 
                        name="name"
                        placeholder="Enter customer name" 
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="input-field">
                      <label className="block text-sm mb-1">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        placeholder="Enter email address" 
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="input-field">
                      <label className="block text-sm mb-1">Phone</label>
                      <input 
                        type="tel" 
                        name="phone"
                        placeholder="Enter phone number" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add Customer
                    </button>
                  </form>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Customer Demographics</h3>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center h-48 flex items-center justify-center">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-2">Customer Segmentation</p>
                      <div className="flex justify-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      </div>
                      <p className="text-sm mt-2">Chart Visualization</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        (Demographics data shown in a pie chart)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {showConfirmation && <ConfirmationMessage />}
        </div>
      </div>
    );
  };

  // Implement a simple store functionality for the preview
  const [cartItems, setCartItems] = useState<{id: number; name: string; price: number; quantity: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // Add to cart function
  const addToCart = (id: number, name: string, price: number) => {
    setCartItems(prevItems => {
      // Check if item is already in cart
      const existingItem = prevItems.find(item => item.id === id);
      
      if (existingItem) {
        // Increase quantity if already in cart
        return prevItems.map(item => 
          item.id === id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { id, name, price, quantity: 1 }];
      }
    });
    
    // Show notification
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };
  
  // Remove from cart function
  const removeFromCart = (id: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === id);
      
      if (existingItem && existingItem.quantity > 1) {
        // Decrease quantity if more than 1
        return prevItems.map(item => 
          item.id === id 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        // Remove item if quantity is 1
        return prevItems.filter(item => item.id !== id);
      }
    });
  };
  
  // Calculate total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Cart Component
  const Cart = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      onClick={() => setShowCart(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-auto p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowCart(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p>Your cart is empty</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setShowCart(false)}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 flex justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-500 text-sm">₹{item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    <div className="ml-4 flex items-center border rounded">
                      <button 
                        className="px-2 py-1 text-gray-500 hover:text-gray-700"
                        onClick={() => removeFromCart(item.id)}
                      >−</button>
                      <span className="px-2">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 text-gray-500 hover:text-gray-700"
                        onClick={() => addToCart(item.id, item.name, item.price)}
                      >+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total:</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              
              <button 
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
  
  // Notification Component
  const Notification = () => (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-up">
      Item added to cart!
    </div>
  );

  // Render content based on file type
  const renderContent = () => {
    // Always show the EcommerceDashboard by default for immediate frontend visibility
    return (
      <>
        <EcommerceDashboard />
        {showCart && <Cart />}
        {showNotification && <Notification />}
        
        {/* Shopping cart button - fixed position */}
        <button 
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          onClick={() => setShowCart(true)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cartItems.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </button>
      </>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 h-full overflow-hidden ${className}`}>
      {/* Add animation styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
      
      {/* Apply any CSS from project files */}
      {cssContent && <style>{cssContent}</style>}
      
      {error ? (
        <div className="text-red-500 p-4 text-sm">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export { StandalonePreview };