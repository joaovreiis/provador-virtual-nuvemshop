import express from 'express';
import crypto from 'node:crypto';
import { initSchema, query } from './db.js';
import { createAdmin, requireAdmin, validateAdmin } from './auth.js';
import { mapFormToPiece } from './utils/normalizePiece.js';
import {
  buildNuvemshopAuthorizationUrl,
  exchangeNuvemshopCode,
  getNuvemshopProduct,
  listNuvemshopProducts,
  mapNuvemshopProduct,
  registerNuvemshopWebhooks
} from './nuvemshop.js';

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

router.post('/admin/create', requireAdmin, async (req, res) => {
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

function assertNuvemshopConfig() {
  const missing = ['NUVEMSHOP_APP_ID', 'NUVEMSHOP_APP_SECRET', 'NUVEMSHOP_REDIRECT_URI']
    .filter((name) => !process.env[name]);
  if (missing.length > 0) throw new Error(`Variáveis ausentes: ${missing.join(', ')}`);
}

async function saveNuvemshopProduct(storeId, product) {
  const existing = await query(
    'SELECT tamanhos FROM roupas WHERE loja_externa_id = $1 AND produto_externo_id = $2',
    [String(storeId), String(product.id)]
  );
  const payload = mapNuvemshopProduct(product, existing.rows[0]?.tamanhos || [], storeId);
  const result = await query(
    `INSERT INTO roupas
       (nome, categoria, descricao, imagem, tamanhos, origem, loja_externa_id,
        produto_externo_id, url_produto, sku, preco, ativo, sincronizado_em, atualizado_externo_em)
     VALUES ($1, $2, $3, $4, $5, 'nuvemshop', $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, $12)
     ON CONFLICT (loja_externa_id, produto_externo_id)
     WHERE loja_externa_id IS NOT NULL AND produto_externo_id IS NOT NULL
     DO UPDATE SET nome = EXCLUDED.nome, categoria = EXCLUDED.categoria,
       descricao = EXCLUDED.descricao, imagem = EXCLUDED.imagem, tamanhos = EXCLUDED.tamanhos,
       url_produto = EXCLUDED.url_produto, sku = EXCLUDED.sku, preco = EXCLUDED.preco,
       ativo = EXCLUDED.ativo, sincronizado_em = CURRENT_TIMESTAMP,
       atualizado_externo_em = EXCLUDED.atualizado_externo_em
     RETURNING id, produto_externo_id`,
    [payload.nome, payload.categoria, payload.descricao, payload.imagem, JSON.stringify(payload.tamanhos),
      payload.loja_externa_id, payload.produto_externo_id, payload.url_produto, payload.sku,
      payload.preco ? JSON.stringify(payload.preco) : null, payload.ativo, payload.atualizado_externo_em]
  );
  return result.rows[0];
}

async function syncNuvemshopStore(storeId, accessToken) {
  const products = await listNuvemshopProducts(storeId, accessToken);
  for (const product of products) await saveNuvemshopProduct(storeId, product);
  await query('UPDATE integracoes_nuvemshop SET ultima_sincronizacao = CURRENT_TIMESTAMP, atualizado_em = CURRENT_TIMESTAMP WHERE loja_id = $1', [String(storeId)]);
  return { total: products.length };
}

router.get('/admin/integracoes/nuvemshop/status', requireAdmin, async (_req, res) => {
  await initSchema();
  const result = await query('SELECT loja_id, nome_loja, ultima_sincronizacao, atualizado_em FROM integracoes_nuvemshop ORDER BY id DESC LIMIT 1');
  res.json({ connected: result.rowCount > 0, integration: result.rows[0] || null });
});

router.get('/admin/integracoes/nuvemshop/connect', requireAdmin, async (_req, res) => {
  try {
    assertNuvemshopConfig();
    await initSchema();
    const state = crypto.randomBytes(32).toString('hex');
    await query('INSERT INTO estados_oauth_nuvemshop (estado) VALUES ($1)', [state]);
    res.json({ url: buildNuvemshopAuthorizationUrl(state) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/integracoes/nuvemshop/callback', async (req, res) => {
  try {
    assertNuvemshopConfig();
    await initSchema();
    const { code, state, store_id: storeId } = req.query;
    if (!code || !state || !storeId) return res.status(400).send('Callback Nuvemshop inválido');
    const stateResult = await query('DELETE FROM estados_oauth_nuvemshop WHERE estado = $1 AND criado_em > CURRENT_TIMESTAMP - INTERVAL \'10 minutes\' RETURNING estado', [state]);
    if (stateResult.rowCount === 0) return res.status(400).send('Estado OAuth inválido ou expirado');
    const token = await exchangeNuvemshopCode(code);
    await query(
      `INSERT INTO integracoes_nuvemshop (loja_id, access_token, nome_loja, atualizado_em)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (loja_id) DO UPDATE SET access_token = EXCLUDED.access_token,
         nome_loja = EXCLUDED.nome_loja, atualizado_em = CURRENT_TIMESTAMP`,
      [String(storeId), token.access_token, token.user_id ? `Loja ${token.user_id}` : null]
    );
    if (process.env.NUVEMSHOP_WEBHOOK_URL) {
      await registerNuvemshopWebhooks(String(storeId), token.access_token);
    }
    res.redirect(process.env.NUVEMSHOP_SUCCESS_REDIRECT || '/admin?integracao=nuvemshop-conectada');
  } catch (error) {
    console.error('Nuvemshop OAuth error:', error);
    res.status(500).send('Não foi possível conectar a Nuvemshop');
  }
});

router.post('/admin/integracoes/nuvemshop/sync', requireAdmin, async (_req, res) => {
  try {
    await initSchema();
    const integration = await query('SELECT loja_id, access_token FROM integracoes_nuvemshop ORDER BY id DESC LIMIT 1');
    if (integration.rowCount === 0) return res.status(409).json({ error: 'Nuvemshop não conectada' });
    res.json(await syncNuvemshopStore(integration.rows[0].loja_id, integration.rows[0].access_token));
  } catch (error) {
    console.error('Nuvemshop sync error:', error);
    res.status(502).json({ error: error.message });
  }
});

router.post('/integracoes/nuvemshop/webhook', async (req, res) => {
  try {
    await initSchema();
    const storeId = req.body?.store_id || req.headers['x-store-id'];
    const productId = req.body?.id || req.body?.product_id;
    if (!storeId || !productId) return res.status(400).json({ error: 'Webhook sem loja ou produto' });
    const integration = await query('SELECT access_token FROM integracoes_nuvemshop WHERE loja_id = $1', [String(storeId)]);
    if (integration.rowCount === 0) return res.status(404).json({ error: 'Loja não conectada' });
    const event = String(req.headers['x-webhook-event'] || req.body?.event || '').toLowerCase();
    if (event.includes('deleted')) {
      await query('UPDATE roupas SET ativo = false, sincronizado_em = CURRENT_TIMESTAMP WHERE loja_externa_id = $1 AND produto_externo_id = $2', [String(storeId), String(productId)]);
    } else {
      const product = await getNuvemshopProduct(storeId, integration.rows[0].access_token, productId);
      await saveNuvemshopProduct(storeId, product);
    }
    res.status(202).json({ ok: true });
  } catch (error) {
    console.error('Nuvemshop webhook error:', error);
    res.status(502).json({ error: error.message });
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
    const result = await query('SELECT id, nome, categoria, descricao, imagem, tamanhos, url_produto, sku, preco, origem FROM roupas WHERE ativo = true ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/roupas', requireAdmin, async (req, res) => {
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

router.put('/roupas/:id', requireAdmin, async (req, res) => {
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

router.delete('/roupas/:id', requireAdmin, async (req, res) => {
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

