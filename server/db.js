import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida no ambiente do servidor');
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
      origem TEXT NOT NULL DEFAULT 'manual',
      loja_externa_id TEXT,
      produto_externo_id TEXT,
      url_produto TEXT,
      sku TEXT,
      preco JSONB,
      ativo BOOLEAN NOT NULL DEFAULT true,
      sincronizado_em TIMESTAMP,
      atualizado_externo_em TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE roupas ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'manual';
    ALTER TABLE roupas ADD COLUMN IF NOT EXISTS loja_externa_id TEXT;
    ALTER TABLE roupas ADD COLUMN IF NOT EXISTS produto_externo_id TEXT;
    ALTER TABLE roupas ADD COLUMN IF NOT EXISTS url_produto TEXT;
    ALTER TABLE roupas ADD COLUMN IF NOT EXISTS sku TEXT;
    ALTER TABLE roupas ADD COLUMN IF NOT EXISTS preco JSONB;
    ALTER TABLE roupas ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE roupas ADD COLUMN IF NOT EXISTS sincronizado_em TIMESTAMP;
    ALTER TABLE roupas ADD COLUMN IF NOT EXISTS atualizado_externo_em TIMESTAMP;

    CREATE UNIQUE INDEX IF NOT EXISTS roupas_nuvemshop_produto_idx
      ON roupas (loja_externa_id, produto_externo_id)
      WHERE loja_externa_id IS NOT NULL AND produto_externo_id IS NOT NULL;

    CREATE TABLE IF NOT EXISTS integracoes_nuvemshop (
      id SERIAL PRIMARY KEY,
      loja_id TEXT UNIQUE NOT NULL,
      access_token TEXT NOT NULL,
      nome_loja TEXT,
      ultima_sincronizacao TIMESTAMP,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS estados_oauth_nuvemshop (
      estado TEXT PRIMARY KEY,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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