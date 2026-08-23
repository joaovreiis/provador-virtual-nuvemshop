import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not defined');
  process.exit(1);
}

const isNeon = process.env.DATABASE_URL.includes('neon.tech');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function initSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS roupas (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      descricao TEXT,
      imagem TEXT,
      tamanhos JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id SERIAL PRIMARY KEY,
      nome TEXT UNIQUE NOT NULL,
      medidas JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO categorias (nome, medidas) VALUES
      ('Blusa', '["busto", "cintura", "quadril"]'::jsonb),
      ('Body', '["busto", "cintura"]'::jsonb),
      ('Calça', '["cintura", "quadril", "comprimento"]'::jsonb),
      ('Vestido', '["busto", "cintura", "quadril", "comprimento"]'::jsonb),
      ('Cropped', '["busto", "cintura"]'::jsonb),
      ('Short', '["cintura", "quadril", "comprimento"]'::jsonb),
      ('Saia', '["cintura", "quadril", "comprimento"]'::jsonb)
    ON CONFLICT (nome) DO NOTHING;
  `);
}