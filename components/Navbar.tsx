
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl">🥘</span>
          <span className="font-bold text-xl tracking-tight text-orange-600">Recettes famille DCB</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/categories" className="text-gray-500 hover:text-orange-600 text-sm font-medium transition-colors">
            Catégories
          </Link>
          <Link 
            to="/add" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-md shadow-orange-100 flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Ajouter
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;