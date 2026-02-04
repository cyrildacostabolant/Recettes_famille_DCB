
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
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? '#000000' : '#ffffff';
  };

  // Fonction centrale de génération du document (Canvas)
  const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!recipe) return null;

    const width = 794; // A4 96 DPI
    const height = 1123;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fond
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 1. Bandeau
    const bandHeight = 75;
    const mainColor = categoryInfo?.color || '#f97316';
    const textColor = getContrastColor(mainColor);
    
    ctx.fillStyle = mainColor;
    ctx.fillRect(0, 0, width, bandHeight);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(recipe.title.toUpperCase(), width / 2, bandHeight / 2 + 10);

    // 2. Image
    let nextY = bandHeight + 40;
    if (recipe.image_url) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = recipe.image_url;
      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error("Image load failed"));
        });

        const displayHeight = 220;
        const ratio = img.width / img.height;
        const displayWidth = Math.min(width - 100, displayHeight * ratio);
        const xPos = (width - displayWidth) / 2;

        ctx.fillStyle = '#000000';
        ctx.fillRect(xPos - 2, nextY - 2, displayWidth + 4, displayHeight + 4);
        ctx.drawImage(img, xPos, nextY, displayWidth, displayHeight);
        nextY += displayHeight + 50;
      } catch (e) {
        nextY += 20;
      }
    }

    // 3. Colonnes
    const col1X = 50;
    const col1Width = (width - 140) * 0.30;
    const col2X = col1X + col1Width + 40;
    const col2Width = (width - 140) * 0.70;

    // Ingrédients
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('INGRÉDIENTS', col1X, nextY);
    
    ctx.font = '15px Inter, sans-serif';
    let ingY = nextY + 35;
    recipe.ingredients.forEach(ing => {
      // Wrap ingredients if too long
      const words = ('• ' + ing).split(' ');
      let line = '';
      words.forEach(word => {
        let testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > col1Width) {
          ctx.fillText(line, col1X, ingY);
          line = word + ' ';
          ingY += 22;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, col1X, ingY);
      ingY += 28;
    });

    // Préparation
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('PRÉPARATION', col2X, nextY);
    
    ctx.font = '15px Inter, sans-serif';
    let stepY = nextY + 35;
    recipe.instructions.forEach((step, idx) => {
      const text = `${idx + 1}. ${step}`;
      const words = text.split(' ');
      let line = '';
      words.forEach(word => {
        let testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > col2Width) {
          ctx.fillText(line, col2X, stepY);
          line = word + ' ';
          stepY += 22;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, col2X, stepY);
      stepY += 35;
    });

    // Separateur vertical
    const finalContentY = Math.max(ingY, stepY);
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(col1X + col1Width + 20, nextY - 10);
    ctx.lineTo(col1X + col1Width + 20, finalContentY);
    ctx.stroke();

    return canvas;
  };

  const handlePrint = async () => {
    const canvas = await generateCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
    
    // Création d'une iframe invisible pour l'impression
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Impression - ${recipe?.title}</title>
            <style>
              @page { margin: 0; size: auto; }
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; display: block; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
          </body>
        </html>
      `);
      doc.close();

      // On attend que l'image soit chargée dans l'iframe avant de lancer l'impression
      const img = doc.querySelector('img');
      if (img) {
        img.onload = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          // Nettoyage après un délai pour laisser le temps au dialogue de s'ouvrir
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        };
      }
    }
  };

  const exportJPG = async () => {
    const canvas = await generateCanvas();
    if (!canvas || !recipe) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.download = `Recette-${recipe.title}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cette recette ?")) return;
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (!error) navigate('/');
    else alert("Erreur lors de la suppression");
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!recipe) return null;

  const categoryColor = categoryInfo?.color || '#f97316';
  const badgeTextColor = getContrastColor(categoryColor);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 animate-slideUp">
      <div className="relative h-64 sm:h-80">
        <img src={recipe.image_url || `https://picsum.photos/seed/${recipe.id}/800/600`} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 flex space-x-2 no-print">
          <button type="button" onClick={() => navigate(-1)} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"><i className="fas fa-arrow-left"></i></button>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2 no-print">
          <button type="button" onClick={handlePrint} title="Imprimer la fiche (Format A4)" className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors cursor-pointer"><i className="fas fa-print"></i></button>
          <button type="button" onClick={exportJPG} title="Télécharger JPG" className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors cursor-pointer"><i className="fas fa-file-image"></i></button>
          <Link to={`/recipe/edit/${recipe.id}`} className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors"><i className="fas fa-edit"></i></Link>
          <button type="button" onClick={handleDelete} className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors cursor-pointer"><i className="fas fa-trash"></i></button>
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
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColor }}></div>
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