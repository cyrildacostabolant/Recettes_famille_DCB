
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

  const getContrastColor = (hexColor: string) => {
    if (!hexColor) return '#ffffff';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? '#000000' : '#ffffff';
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
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all border-2 ${
              activeCategory === 'Tous' 
                ? 'shadow-lg shadow-orange-200 scale-105 border-orange-600' 
                : 'bg-white text-orange-500 border-orange-500 hover:bg-orange-50'
            }`}
            style={{ 
              backgroundColor: activeCategory === 'Tous' ? '#f97316' : undefined,
              color: activeCategory === 'Tous' ? '#ffffff' : undefined,
            }}
          >
            Tous
          </button>
          {categories.map(cat => {
            const isActive = activeCategory === cat.name;
            const contrastText = getContrastColor(cat.color);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                  isActive ? 'shadow-xl scale-110 z-10' : 'opacity-85 hover:opacity-100 scale-100'
                }`}
                style={{ 
                  backgroundColor: cat.color,
                  color: contrastText,
                  borderColor: isActive ? contrastText : 'transparent',
                  boxShadow: isActive ? `0 10px 20px -5px ${cat.color}88` : 'none'
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-400 font-medium">Aucune recette trouvée pour cette recherche.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
