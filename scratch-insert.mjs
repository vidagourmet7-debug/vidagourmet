import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ndaiwxznizzydwtgwcdh.supabase.co';
const supabaseKey = 'sb_publishable_VCcdKGTBSN0cr3XEPWYVuA_PGpuy_75'; // Wait, let me use the one from .env.local
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: categorias } = await supabase.from('categorias').select('*');
  console.log('Categorias:', categorias);

  if (!categorias || categorias.length === 0) return;

  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre: 'Test Producto',
      descripcion: 'Test Desc',
      precio: 100,
      categoria_id: categorias[0].id,
      activo: true,
      menu_semanal: false,
      unidad_venta: 'unidad',
      imagen_url: null,
    })
    .select()
    .single();

  console.log('Insert Result:', data);
  console.log('Insert Error:', error);
}

test();
