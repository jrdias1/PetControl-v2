import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const products = [
    { name: 'Ração Seca Premium (Cães)', duration_days: 30, lead_time_days: 5 },
    { name: 'Ração Seca Premium (Gatos)', duration_days: 30, lead_time_days: 5 },
    { name: 'Antipulgas e Carrapatos (3 meses)', duration_days: 90, lead_time_days: 15 },
    { name: 'Antipulgas e Carrapatos (6 meses)', duration_days: 180, lead_time_days: 20 },
    { name: 'Vermífugo', duration_days: 90, lead_time_days: 10 },
    { name: 'Shampoo Antipulgas', duration_days: 45, lead_time_days: 7 },
    { name: 'Areia Higiênica para Gatos', duration_days: 30, lead_time_days: 5 },
    { name: 'Petisco Funcional (Dental)', duration_days: 30, lead_time_days: 5 },
    { name: 'Coleira Antipulgas', duration_days: 180, lead_time_days: 20 },
    { name: 'Brinquedo Interativo', duration_days: 60, lead_time_days: 10 }
];

async function seed() {
    console.log('🌱 Iniciando semeadura de produtos...');

    // Opcional: Limpar produtos existentes (cuidado em produção!)
    // const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { data, error } = await supabase
        .from('products')
        .insert(products)
        .select();

    if (error) {
        console.error('❌ Erro ao semear produtos:', error);
        return;
    }

    console.log('✅ Produtos semeados com sucesso!', data.length, 'itens inseridos.');
}

seed();
