
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Recipe, Category } from '../types';
import { supabase } from '../supabaseClient';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [color, setColor] = useState('#f97316');

  useEffect(() => {
    const fetchColor = async () => {
      const { data } = await supabase.from('categories').select('color').eq('name', recipe.category).single();
      if (data) setColor(data.color);
    };
    fetchColor();
  }, [recipe.category]);

  return (
    <Link 
      to={`/recipe/${recipe.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img src={recipe.image_url || `https://picsum.photos/seed/${recipe.id}/400/300`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: color }}>
            {recipe.category}
          </span>
        </div>
      </div>
      <div className="p-4 flex-grow">
        <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">{recipe.title}</h3>
        <p className="text-gray-400 text-xs mt-2 italic">{recipe.ingredients.length} ingrédients</p>
      </div>
    </Link>
  );
};

export default RecipeCard;
