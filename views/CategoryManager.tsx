
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Category } from '../types';

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#f97316');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const { error } = await supabase.from('categories').insert({ name: newName.trim(), color: newColor });
    if (error) alert(error.message);
    else {
      setNewName('');
      fetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ? Les recettes associées resteront mais n'auront plus de couleur personnalisée.")) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h1 className="text-2xl font-black mb-6 flex items-center">
          <i className="fas fa-tags mr-3 text-orange-500"></i>
          Gérer les catégories
        </h1>

        <form onSubmit={handleAdd} className="flex gap-2 mb-8">
          <input 
            type="text" placeholder="Nom (Ex: Brunch)" required
            className="flex-grow px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
            value={newName} onChange={e => setNewName(e.target.value)}
          />
          <input 
            type="color" className="w-12 h-10 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
            value={newColor} onChange={e => setNewColor(e.target.value)}
          />
          <button type="submit" className="bg-orange-500 text-white px-4 rounded-xl font-bold">Ajouter</button>
        </form>

        <div className="space-y-3">
          {loading ? <div className="animate-pulse h-20 bg-gray-100 rounded-xl"></div> : categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="font-bold text-gray-700">{cat.name}</span>
              </div>
              <button onClick={() => handleDelete(cat.id)} className="text-gray-300 hover:text-red-500">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
