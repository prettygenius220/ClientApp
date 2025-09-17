import { Link } from 'react-router-dom';
import { Hammer, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../lib/constants';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              aria-label="Home"
            >
              <Hammer className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
            </Link>
          </div>

          {/* Navigation links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/contact"
              className="text-gray-700 hover:text-indigo-600 transition-colors"
              aria-label="Contact us"
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  to="/todos"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                  aria-label="View my todos"
                >
                  My Todos
                </Link>
                <Link
                  to="/clients"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                  aria-label="Manage clients"
                >
                  Clients
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                  aria-label="Sign in to your account"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  aria-label="Create a new account"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}