import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nova senha fornecida pelo usuário: jr@92294269
// O '@' precisa ser codificado como %40 na string de conexão
const password = 'jr@92294269';
const encodedPassword = encodeURIComponent(password);
const connectionString = `postgresql://postgres:${encodedPassword}@db.gzxalmghhddrtvpwchnj.supabase.co:5432/postgres`;

async function run() {
    console.log('Tentando conexão com a nova senha...');
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao Supabase com sucesso!');

        const schema = fs.readFileSync(path.join(__dirname, 'supabase_schema.sql'), 'utf8');

        console.log('🚀 Aplicando schema...');
        await client.query(schema);
        console.log('✨ Schema aplicado com sucesso! Tabelas e triggers criados.');

    } catch (err) {
        console.error('❌ Erro de conexão:', err.message);
    } finally {
        await client.end();
        console.log('Conexão encerrada.');
    }
}

run();
