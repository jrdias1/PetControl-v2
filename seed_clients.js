import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const clients = [
    { full_name: 'Ana Silva', phone: '11988887777', pet_name: 'Thor (Golden)' },
    { full_name: 'Bruno Oliveira', phone: '11977776666', pet_name: 'Mel (Poodle)' },
    { full_name: 'Carla Santos', phone: '11966665555', pet_name: 'Luna (Gato)' },
    { full_name: 'Diego Lima', phone: '11955554444', pet_name: 'Rex (Vira-lata)' },
    { full_name: 'Elena Costa', phone: '11944443333', pet_name: 'Bolinha (Hamster)' },
    { full_name: 'Fabio Junior', phone: '11933332222', pet_name: 'Max (Beagle)' },
    { full_name: 'Gisele Bündchen', phone: '11922221111', pet_name: 'Vida (Yorkshire)' },
    { full_name: 'Helio Luz', phone: '11911110000', pet_name: 'Faísca (Dálmata)' },
    { full_name: 'Iris Mar', phone: '11900009999', pet_name: 'Ariel (Peixe)' },
    { full_name: 'João Dapper', phone: '11899998888', pet_name: 'Zeca (Bulldog)' }
];

async function seed() {
    console.log('👥 Iniciando semeadura de clientes...');

    const { data, error } = await supabase
        .from('clients')
        .insert(clients)
        .select();

    if (error) {
        console.error('❌ Erro ao semear clientes:', error);
        return;
    }

    console.log('✅ Clientes semeados com sucesso!', data.length, 'itens inseridos.');
}

seed();
