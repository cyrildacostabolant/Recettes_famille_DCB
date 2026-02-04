
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zqxqeqdenndhtvktmabs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxeHFlcWRlbm5kaHR2a3RtYWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTQ5NzEsImV4cCI6MjA4NTczMDk3MX0.asmgW0evKL8u9AJDNIt4EGh9Umx1cW8Ei9BOYjVSGCE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * SQL À EXÉCUTER DANS LE SQL EDITOR DE SUPABASE :
 * 
 * -- 1. Tables de base
 * CREATE TABLE IF NOT EXISTS categories (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   name TEXT UNIQUE NOT NULL,
 *   color TEXT NOT NULL DEFAULT '#f97316',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
 * );
 * 
 * CREATE TABLE IF NOT EXISTS recipes (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   category TEXT NOT NULL,
 *   ingredients TEXT[] DEFAULT '{}',
 *   instructions TEXT[] DEFAULT '{}',
 *   image_url TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
 * );
 * 
 * -- FIX POUR L'ERREUR "recipes_category_check" :
 * -- Cette commande supprime la restriction qui empêche d'utiliser de nouvelles catégories
 * ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_category_check;
 * 
 * -- 2. RLS pour les tables
 * ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Accès public catégories" ON categories FOR ALL USING (true) WITH CHECK (true);
 * 
 * ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Accès public recettes" ON recipes FOR ALL USING (true) WITH CHECK (true);
 * 
 * -- 3. CONFIGURATION DU STORAGE
 * -- Créez le bucket 'recipe-images' en mode PUBLIC dans l'interface Supabase.
 * 
 * CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'recipe-images');
 * CREATE POLICY "Allow public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'recipe-images');
 * CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'recipe-images');
 * CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'recipe-images');
 */