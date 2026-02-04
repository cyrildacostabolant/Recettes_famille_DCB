
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Category } from '../types';

const AddRecipeView: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data && data.length > 0) {
        setCategories(data);
        setCategory(data[0].name);
      }
    };
    fetchCategories();
  }, []);

  const handleAddField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const handleFieldChange = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleRemoveField = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => {
    if (list.length > 1) {
      setter(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const filteredIngredients = ingredients.filter(i => i.trim() !== '');
    const filteredInstructions = instructions.filter(i => i.trim() !== '');

    if (!title.trim() || filteredIngredients.length === 0 || filteredInstructions.length === 0) {
      alert("Veuillez remplir tous les champs obligatoires (Titre, Ingrédients, Instructions).");
      return;
    }

    try {
      setLoading(true);
      let imageUrl = '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          if (uploadError.message.includes('not found')) {
            throw new Error("Le dossier 'recipe-images' n'existe pas dans votre Storage Supabase. Veuillez créer un bucket 'recipe-images' en mode PUBLIC.");
          }
          throw new Error(`Erreur lors de l'envoi de l'image : ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('recipes')
        .insert({
          title: title.trim(),
          category,
          ingredients: filteredIngredients,
          instructions: filteredInstructions,
          image_url: imageUrl
        });

      if (insertError) {
        throw new Error(`Erreur Base de données : ${insertError.message}`);
      }

      alert('Recette publiée avec succès !');
      navigate('/');
    } catch (error: any) {
      console.error('Erreur complète:', error);
      alert(error.message || "Une erreur inconnue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto overflow-hidden animate-slideUp">
      <div className="bg-orange-500 p-8 text-white">
        <h1 className="text-3xl font-black">Ajouter une pépite</h1>
        <p className="opacity-90">Partagez votre savoir-faire culinaire.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase">Nom de la recette</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Tarte Tatin de Mamie"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase">Catégorie</label>
            <div className="relative">
              <select 
                value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 uppercase">Photo (Optionnel)</label>
          <div className={`relative h-48 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${imagePreview ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
            {imagePreview ? (
              <>
                <img src={imagePreview} className="w-full h-full object-cover" />
                <button type="button" onClick={() => {setImageFile(null); setImagePreview(null);}} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg"><i className="fas fa-times"></i></button>
              </>
            ) : (
              <div className="text-center p-4">
                <i className="fas fa-camera text-3xl text-gray-300 mb-2"></i>
                <p className="text-sm text-gray-400 font-medium">Ajouter une photo</p>
                <p className="text-[10px] text-gray-300 uppercase mt-1">JPG, PNG jusqu'à 5Mo</p>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="font-bold text-gray-700 uppercase flex justify-between items-center">
            Ingrédients 
            <button type="button" onClick={() => handleAddField(setIngredients)} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase hover:bg-orange-200 transition-colors">+ Ajouter</button>
          </label>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex space-x-2 group">
              <input 
                type="text" value={ing} onChange={(e) => handleFieldChange(idx, e.target.value, setIngredients)} 
                className="flex-grow px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
                placeholder={`Ex: 200g de farine`} 
              />
              <button type="button" onClick={() => handleRemoveField(idx, setIngredients, ingredients)} className="text-gray-300 hover:text-red-500 transition-colors">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <label className="font-bold text-gray-700 uppercase flex justify-between items-center">
            Étapes de préparation
            <button type="button" onClick={() => handleAddField(setInstructions)} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase hover:bg-orange-200 transition-colors">+ Ajouter</button>
          </label>
          {instructions.map((step, idx) => (
            <div key={idx} className="flex space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">{idx + 1}</div>
              <textarea 
                value={step} onChange={(e) => handleFieldChange(idx, e.target.value, setInstructions)} 
                className="flex-grow px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 h-24 focus:ring-2 focus:ring-orange-500 outline-none" 
                placeholder={`Décrivez cette étape...`} 
              />
              <button type="button" onClick={() => handleRemoveField(idx, setInstructions, instructions)} className="text-gray-300 hover:text-red-500 transition-colors">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl shadow-orange-100 transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 hover:-translate-y-1'}`}>
          {loading ? (
            <span className="flex items-center justify-center">
              <i className="fas fa-circle-notch animate-spin mr-3"></i>
              Envoi en cours...
            </span>
          ) : 'Publier ma recette'}
        </button>
      </form>
    </div>
  );
};

export default AddRecipeView;
