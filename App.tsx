
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import RecipeDetailView from './views/RecipeDetailView';
import AddRecipeView from './views/AddRecipeView';
import EditRecipeView from './views/EditRecipeView';
import CategoryManager from './views/CategoryManager';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipe/:id" element={<RecipeDetailView />} />
            <Route path="/recipe/edit/:id" element={<EditRecipeView />} />
            <Route path="/add" element={<AddRecipeView />} />
            <Route path="/categories" element={<CategoryManager />} />
          </Routes>
        </main>
        <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-200 bg-white">
          &copy; {new Date().getFullYear()} Recettes famille DCB - Carnet culinaire intelligent.
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;