import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Image, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAdmin = user?.role === 'admin';
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const sidebarClasses = `bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${
    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
  } md:relative md:translate-x-0 transition duration-200 ease-in-out z-30`;
  
  return (
    <>
      <button 
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-gray-800 text-white"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      
      <div className={sidebarClasses}>
        <div className="flex items-center space-x-2 px-4">
          <Database className="h-8 w-8" />
          <span className="text-2xl font-semibold">HeadlessCMS</span>
        </div>
        
        <div className="px-4 py-2 border-t border-gray-700">
          <p className="text-gray-400 text-sm">Signed in as:</p>
          <p className="font-medium">{user?.username}</p>
          <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
        </div>
        
        <nav className="flex flex-col space-y-1">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
          
          {(isAdmin) && (
            <NavLink 
              to="/content-types" 
              className={({ isActive }) => 
                `flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 ${
                  isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Database className="h-5 w-5" />
              <span>Content Types</span>
            </NavLink>
          )}
          
          <NavLink 
            to="/contents" 
            className={({ isActive }) => 
              `flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FileText className="h-5 w-5" />
            <span>Content</span>
          </NavLink>
          
          <NavLink 
            to="/media" 
            className={({ isActive }) => 
              `flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image className="h-5 w-5" />
            <span>Media</span>
          </NavLink>
          
          {isAdmin && (
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 ${
                  isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </NavLink>
          )}
        </nav>
        
        <div className="px-4 mt-auto">
          <button 
            onClick={logout}
            className="flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 text-gray-400 hover:bg-gray-700 hover:text-white w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;