
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Recipe, Category } from '../types';

const RecipeDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchRecipe(id);
  }, [id]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('recipes').select('*').eq('id', recipeId).single();
      if (error) throw error;
      setRecipe(data);

      // Fetch color info
      const { data: catData } = await supabase.from('categories').select('*').eq('name', data.category).single();
      if (catData) setCategoryInfo(catData);
    } catch (error) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getContrastColor = (hexColor: string) => {
    if (!hexColor) return '#ffffff';
    // Remove hash if present
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Formula for perceived brightness
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? '#000000' : '#ffffff';
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cette recette ?")) return;
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (!error) navigate('/');
    else alert("Erreur lors de la suppression");
  };

  const exportJPG = async () => {
    if (!recipe) return;

    // Dimensions A4 à 96 DPI
    const width = 794; 
    const height = 1123;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 1. Bandeau (2cm ≈ 75px)
    const bandHeight = 75;
    const mainColor = categoryInfo?.color || '#f97316';
    const textColor = getContrastColor(mainColor);
    
    ctx.fillStyle = mainColor;
    ctx.fillRect(0, 0, width, bandHeight);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(recipe.title.toUpperCase(), width / 2, bandHeight / 2 + 10);

    // 2. Photo (5cm ≈ 190px de haut)
    let nextY = bandHeight + 40;
    if (recipe.image_url) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = recipe.image_url;
      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const displayHeight = 190;
        const ratio = img.width / img.height;
        const displayWidth = displayHeight * ratio;
        const xPos = (width - displayWidth) / 2;

        // Bordure 2px
        ctx.fillStyle = '#000000';
        ctx.fillRect(xPos - 2, nextY - 2, displayWidth + 4, displayHeight + 4);
        ctx.drawImage(img, xPos, nextY, displayWidth, displayHeight);
        nextY += displayHeight + 50;
      } catch (e) {
        console.error("Erreur chargement image pour export:", e);
        nextY += 20;
      }
    }

    // 3. Contenu Colonnes 1/4 - 3/4
    const col1X = 50;
    const col1Width = (width - 100) * 0.25;
    const col2X = col1X + col1Width + 40;
    const col2Width = (width - 100) * 0.75 - 40;

    // Ingrédients
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('INGRÉDIENTS', col1X, nextY);
    
    ctx.font = '14px Inter, sans-serif';
    let ingY = nextY + 30;
    recipe.ingredients.forEach(ing => {
      ctx.fillText('• ' + ing, col1X, ingY, col1Width);
      ingY += 22;
    });

    // Instructions
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('PRÉPARATION', col2X, nextY);
    
    ctx.font = '14px Inter, sans-serif';
    let stepY = nextY + 30;
    recipe.instructions.forEach((step, idx) => {
      const text = `Etape ${idx + 1} : ${step}`;
      // Basic line wrapping
      const words = text.split(' ');
      let line = '';
      words.forEach(word => {
        let testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > col2Width) {
          ctx.fillText(line, col2X, stepY);
          line = word + ' ';
          stepY += 20;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, col2X, stepY);
      stepY += 35;
    });

    // 4. Ligne séparatrice (2px d'épaisseur)
    const finalContentY = Math.max(ingY, stepY);
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(col1X + col1Width + 20, nextY);
    ctx.lineTo(col1X + col1Width + 20, finalContentY);
    ctx.stroke();

    // Download
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.download = `Recette-${recipe.title}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!recipe) return null;

  const categoryColor = categoryInfo?.color || '#f97316';
  const badgeTextColor = getContrastColor(categoryColor);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 animate-slideUp">
      <div className="relative h-64 sm:h-80">
        <img src={recipe.image_url || `https://picsum.photos/seed/${recipe.id}/800/600`} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 flex space-x-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"><i className="fas fa-arrow-left"></i></button>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2">
          <button onClick={exportJPG} title="Exporter JPG" className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600"><i className="fas fa-file-image"></i></button>
          <Link to={`/recipe/edit/${recipe.id}`} className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600"><i className="fas fa-edit"></i></Link>
          <button onClick={handleDelete} className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600"><i className="fas fa-trash"></i></button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <header className="space-y-2 text-center">
          <span className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm" style={{ backgroundColor: categoryColor, color: badgeTextColor }}>
            {recipe.category}
          </span>
          <h1 className="text-4xl font-black text-gray-900">{recipe.title}</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <aside className="space-y-4">
            <h2 className="font-black text-lg border-b-2 pb-2" style={{ borderColor: categoryColor }}>INGRÉDIENTS</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center space-x-2 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }}></div>
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </aside>

          <section className="md:col-span-2 space-y-4">
            <h2 className="font-black text-lg border-b-2 pb-2" style={{ borderColor: categoryColor }}>PRÉPARATION</h2>
            <div className="space-y-6">
              {recipe.instructions.map((step, i) => (
                <div key={i} className="flex space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: categoryColor }}>{i + 1}</span>
                  <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailView;