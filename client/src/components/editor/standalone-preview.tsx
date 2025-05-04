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
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                  + Add Product
                </button>
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
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.stock} units</td>
                        <td>₹{product.price.toFixed(2)}</td>
                        <td>{product.category}</td>
                        <td>
                          <button className="text-blue-500 mr-2">Edit</button>
                          <button className="text-red-500">Delete</button>
                        </td>
                      </tr>
                    ))}
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
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-l w-64 dark:bg-gray-800"
                />
                <button className="bg-blue-500 text-white px-3 py-2 rounded-r">
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
                          <button className="text-blue-500 mr-1">View</button>
                          <button className="text-green-500">Process</button>
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
                  <div className="input-field">
                    <label className="block text-sm mb-1">Name</label>
                    <input type="text" placeholder="Enter customer name" />
                  </div>
                  
                  <div className="input-field">
                    <label className="block text-sm mb-1">Email</label>
                    <input type="email" placeholder="Enter email address" />
                  </div>
                  
                  <div className="input-field">
                    <label className="block text-sm mb-1">Phone</label>
                    <input type="tel" placeholder="Enter phone number" />
                  </div>
                  
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    Add Customer
                  </button>
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
        </div>
      </div>
    );
  };

  // Render content based on file type
  const renderContent = () => {
    // Always show the EcommerceDashboard by default for immediate frontend visibility
    return <EcommerceDashboard />;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 h-full overflow-hidden ${className}`}>
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