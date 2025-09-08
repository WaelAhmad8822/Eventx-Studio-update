import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">EventX Studio</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-gray-700 hover:text-blue-600 transition-colors ${
                isActive('/') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`text-gray-700 hover:text-blue-600 transition-colors ${
                isActive('/events') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Events
            </Link>

            {user ? (
              <>
                {user.role === 'admin' ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`text-gray-700 hover:text-blue-600 transition-colors ${
                        isActive('/admin/dashboard') ? 'text-blue-600 font-semibold' : ''
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/events"
                      className={`text-gray-700 hover:text-blue-600 transition-colors ${
                        isActive('/admin/events') ? 'text-blue-600 font-semibold' : ''
                      }`}
                    >
                      Manage Events
                    </Link>
                    <Link
                      to="/admin/tickets"
                      className={`text-gray-700 hover:text-blue-600 transition-colors ${
                        isActive('/admin/tickets') ? 'text-blue-600 font-semibold' : ''
                      }`}
                    >
                      Tickets
                    </Link>
                    <Link
                      to="/admin/analytics"
                      className={`text-gray-700 hover:text-blue-600 transition-colors ${
                        isActive('/admin/analytics') ? 'text-blue-600 font-semibold' : ''
                      }`}
                    >
                      Analytics
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/my-tickets"
                    className={`text-gray-700 hover:text-blue-600 transition-colors ${
                      isActive('/my-tickets') ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    My Tickets
                  </Link>
                )}

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                    <span>{user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-gray-500">{user.email}</div>
                      <div className="text-xs text-blue-600 capitalize">{user.role}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  isActive('/') ? 'text-blue-600 font-semibold' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/events"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  isActive('/events') ? 'text-blue-600 font-semibold' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>

              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className={`text-gray-700 hover:text-blue-600 transition-colors ${
                          isActive('/admin/dashboard') ? 'text-blue-600 font-semibold' : ''
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/events"
                        className={`text-gray-700 hover:text-blue-600 transition-colors ${
                          isActive('/admin/events') ? 'text-blue-600 font-semibold' : ''
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Manage Events
                      </Link>
                      <Link
                        to="/admin/tickets"
                        className={`text-gray-700 hover:text-blue-600 transition-colors ${
                          isActive('/admin/tickets') ? 'text-blue-600 font-semibold' : ''
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tickets
                      </Link>
                      <Link
                        to="/admin/analytics"
                        className={`text-gray-700 hover:text-blue-600 transition-colors ${
                          isActive('/admin/analytics') ? 'text-blue-600 font-semibold' : ''
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Analytics
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/my-tickets"
                      className={`text-gray-700 hover:text-blue-600 transition-colors ${
                        isActive('/my-tickets') ? 'text-blue-600 font-semibold' : ''
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Tickets
                    </Link>
                  )}

                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-700 mb-2">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-gray-500">{user.email}</div>
                      <div className="text-xs text-blue-600 capitalize">{user.role}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
