
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Recipe, Category } from '../types';
import RecipeCard from '../components/RecipeCard';

const Home: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [resRecipes, resCats] = await Promise.all([
      supabase.from('recipes').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name')
    ]);
    if (resRecipes.data) setRecipes(resRecipes.data);
    if (resCats.data) setCategories(resCats.data);
    setLoading(false);
  };

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Tous' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          Qu'est-ce qu'on <span className="text-orange-500">mange</span> ?
        </h1>
      </header>

      <div className="space-y-4">
        <div className="relative max-w-xl mx-auto">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" placeholder="Rechercher..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex justify-center flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('Tous')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === 'Tous' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
          >
            Tous
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all border`}
              style={{ 
                backgroundColor: activeCategory === cat.name ? cat.color : '#ffffff',
                color: activeCategory === cat.name ? '#ffffff' : '#9ca3af',
                borderColor: activeCategory === cat.name ? cat.color : '#f3f4f6'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
      )}
    </div>
  );
};

export default Home;
