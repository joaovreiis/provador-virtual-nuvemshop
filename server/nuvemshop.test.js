import test from 'node:test';
import assert from 'node:assert/strict';
import { mapNuvemshopProduct } from './nuvemshop.js';

test('mapNuvemshopProduct converte produto e preserva medidas da variante', () => {
  const product = {
    id: 42,
    store_id: 7,
    name: { pt: 'Vestido Solar', es: 'Vestido Solar' },
    description: { pt: 'Vestido leve' },
    categories: [{ name: { pt: 'Vestido' } }],
    images: [{ src: 'https://cdn.example/vestido.jpg' }],
    canonical_url: 'https://loja.example/vestido-solar',
    published_at: '2026-08-01T10:00:00Z',
    variants: [{ id: 99, name: 'M', sku: 'VS-M', price: '199.90', stock: 3 }]
  };

  const result = mapNuvemshopProduct({ ...product, store_id: undefined }, [{
    label: 'M',
    variantId: '99',
    measurements: { bust: '88-92', waist: '70-74' }
  }], 7);

  assert.equal(result.nome, 'Vestido Solar');
  assert.equal(result.categoria, 'Vestido');
  assert.equal(result.url_produto, product.canonical_url);
  assert.deepEqual(result.tamanhos[0].measurements, { bust: '88-92', waist: '70-74' });
  assert.equal(result.tamanhos[0].stock, 3);
  assert.equal(result.produto_externo_id, '42');
});