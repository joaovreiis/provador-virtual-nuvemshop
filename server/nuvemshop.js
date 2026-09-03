const NUVEMSHOP_API_URL = 'https://api.tiendanube.com/v1';

function localizedValue(value, fallback = '') {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return fallback;
  return value.pt || value['pt-BR'] || value.es || value.en || Object.values(value)[0] || fallback;
}

function firstImage(product) {
  return product.images?.[0]?.src || product.images?.[0]?.url || '';
}

function productCategory(product) {
  return localizedValue(product.categories?.[0]?.name, 'Sem categoria');
}

function variantLabel(variant, index) {
  const values = [variant.values?.[0]?.es, variant.values?.[0]?.pt, variant.values?.[0]?.en]
    .filter(Boolean);
  return variant.name || values[0] || variant.sku || `Tamanho ${index + 1}`;
}

export function mapNuvemshopProduct(product, existingSizes = [], storeId = product.store_id) {
  const oldSizes = new Map(existingSizes.map((size) => [String(size.variantId || size.label), size]));
  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants
    : [{ id: `${product.id}-default`, sku: '', price: null, stock: null }];

  return {
    nome: localizedValue(product.name, `Produto ${product.id}`),
    categoria: productCategory(product),
    descricao: localizedValue(product.description),
    imagem: firstImage(product),
    url_produto: product.canonical_url || product.permalink || '',
    sku: variants[0]?.sku || '',
    preco: variants[0]?.price ? { valor: variants[0].price, moeda: product.currency || 'BRL' } : null,
    ativo: product.published_at !== null && product.published_at !== undefined,
    tamanhos: variants.map((variant, index) => {
      const previous = oldSizes.get(String(variant.id)) || oldSizes.get(variantLabel(variant, index));
      return {
        ...(previous || {}),
        label: variantLabel(variant, index),
        variantId: String(variant.id),
        sku: variant.sku || '',
        price: variant.price || null,
        stock: variant.stock ?? null,
        measurements: previous?.measurements || {}
      };
    }),
    loja_externa_id: String(storeId),
    produto_externo_id: String(product.id),
    atualizado_externo_em: product.updated_at || null
  };
}

async function nuvemshopRequest(storeId, accessToken, path, options = {}) {
  const response = await fetch(`${NUVEMSHOP_API_URL}/${storeId}${path}`, {
    ...options,
    headers: {
      Authentication: `bearer ${accessToken}`,
      'User-Agent': process.env.NUVEMSHOP_USER_AGENT || 'Provador Virtual (contato@exemplo.com)',
      Accept: 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Nuvemshop respondeu ${response.status}: ${details.slice(0, 500)}`);
  }
  return response.json();
}

export async function listNuvemshopProducts(storeId, accessToken) {
  const products = [];
  for (let page = 1; page <= 100; page += 1) {
    const batch = await nuvemshopRequest(storeId, accessToken, `/products?per_page=250&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    products.push(...batch);
    if (batch.length < 250) break;
  }
  return products;
}

export async function getNuvemshopProduct(storeId, accessToken, productId) {
  return nuvemshopRequest(storeId, accessToken, `/products/${encodeURIComponent(productId)}`);
}

export async function registerNuvemshopWebhooks(storeId, accessToken) {
  const events = ['product/created', 'product/updated', 'product/deleted'];
  for (const event of events) {
    await nuvemshopRequest(storeId, accessToken, '/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, url: process.env.NUVEMSHOP_WEBHOOK_URL })
    });
  }
}

export async function exchangeNuvemshopCode(code) {
  const response = await fetch('https://www.tiendanube.com/apps/authorize/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.NUVEMSHOP_APP_ID,
      client_secret: process.env.NUVEMSHOP_APP_SECRET,
      grant_type: 'authorization_code',
      code
    })
  });
  if (!response.ok) throw new Error(`Falha ao trocar código Nuvemshop (${response.status})`);
  return response.json();
}

export function buildNuvemshopAuthorizationUrl(state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.NUVEMSHOP_APP_ID,
    redirect_uri: process.env.NUVEMSHOP_REDIRECT_URI,
    state
  });
  return `https://www.tiendanube.com/apps/${encodeURIComponent(process.env.NUVEMSHOP_APP_ID)}/authorize?${params}`;
}
