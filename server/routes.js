import express from 'express';
import { initSchema, query } from './db.js';
import { createAdmin, requireAdmin, validateAdmin } from './auth.js';
import { mapFormToPiece } from './utils/normalizePiece.js';

const router = express.Router();

router.get('/health', async (_req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL não definida' });
    }
    await initSchema();
    res.json({ ok: true, hasDatabase: !!process.env.DATABASE_URL });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    await initSchema();
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e Senha são obrigatórios' });
    }
    const auth = await validateAdmin(username, password);
    if (!auth) {
      return res.status(401).json({ error: 'Usuário ou Senha inválidas' });
    }
    res.json(auth);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Erro ao autenticar' });
  }
});

router.post('/admin/create', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Informe o usuário e senha' });
    }
    const admin = await createAdmin(username, password);
    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/categorias', async (_req, res) => {
  try {
    await initSchema();
    const result = await query('SELECT id, nome, medidas FROM categorias ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/categorias', requireAdmin, async (req, res) => {
  try {
    await initSchema();
    const nome = req.body?.nome?.trim();
    const medidas = Array.isArray(req.body?.medidas) ? [...new Set(req.body.medidas)] : [];
    const medidasValidas = medidas.filter((medida) => ['busto', 'cintura', 'quadril', 'comprimento'].includes(medida));

    if (!nome || medidasValidas.length === 0) {
      return res.status(400).json({ error: 'Informe o nome e pelo menos uma medida' });
    }

    const result = await query(
      'INSERT INTO categorias (nome, medidas) VALUES ($1, $2) RETURNING id, nome, medidas',
      [nome, JSON.stringify(medidasValidas)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Já existe uma categoria com esse nome' });
    res.status(500).json({ error: error.message });
  }
});

router.delete('/categorias/:id', requireAdmin, async (req, res) => {
  try {
    await initSchema();
    const usada = await query(
      'SELECT 1 FROM roupas WHERE categoria = (SELECT nome FROM categorias WHERE id = $1) LIMIT 1',
      [req.params.id]
    );
    if (usada.rowCount > 0) return res.status(409).json({ error: 'Não é possível excluir uma categoria usada por peças' });

    const result = await query('DELETE FROM categorias WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/roupas', async (_req, res) => {
  try {
    await initSchema();
    const result = await query('SELECT id, nome, categoria, descricao, imagem, tamanhos FROM roupas ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/roupas', async (req, res) => {
  try {
    await initSchema();
    const payload = mapFormToPiece(req.body);
    const result = await query(
      'INSERT INTO roupas (nome, categoria, descricao, imagem, tamanhos) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [payload.nome, payload.categoria, payload.descricao, payload.imagem, JSON.stringify(payload.tamanhos)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/roupas/:id', async (req, res) => {
  try {
    await initSchema();
    const payload = mapFormToPiece(req.body);
    const result = await query(
      `UPDATE roupas
       SET nome = $1, categoria = $2, descricao = $3, imagem = $4, tamanhos = $5
       WHERE id = $6
       RETURNING *`,
      [payload.nome, payload.categoria, payload.descricao, payload.imagem, JSON.stringify(payload.tamanhos), req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Roupa não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/roupas/:id', async (req, res) => {
  try {
    await initSchema();
    const result = await query('DELETE FROM roupas WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Roupa não encontrada' });
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
