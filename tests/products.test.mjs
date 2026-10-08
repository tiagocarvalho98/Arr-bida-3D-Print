import test from 'node:test';
import assert from 'node:assert/strict';
import { products, validateConfiguration } from '../scripts/products.mjs';

test('three mock products have independent required fields', () => {
  assert.equal(products.length, 3);
  assert.deepEqual(products.map(p => p.name), ['Produto 1', 'Produto 2', 'Produto 3']);
  assert.ok(products[1].fields.some(f => f.name === 'city' && f.required));
  assert.ok(!products[0].fields.some(f => f.name === 'city'));
});
test('QR requires business, city, contact and safe destination', () => {
  const data = { business: 'Negócio exemplo', city: 'Setúbal', contact: 'exemplo@example.com', url: 'https://example.com/menu', quantity: '2', color: 'Preto' };
  assert.deepEqual(validateConfiguration('produto-2', data), {});
  for (const name of ['business', 'city', 'contact', 'url']) {
    assert.ok(validateConfiguration('produto-2', {...data, [name]: ' '})[name]);
  }
  assert.ok(validateConfiguration('produto-2', {...data, url: 'javascript:alert(1)'}).url);
  assert.ok(validateConfiguration('produto-2', {...data, url: 'file:///local'}).url);
  assert.ok(validateConfiguration('produto-2', {...data, quantity: '1.5'}).quantity);
  assert.ok(validateConfiguration('produto-2', {...data, quantity: '0'}).quantity);
});
test('unknown products and invalid options do not produce valid configurations', () => {
  assert.ok(validateConfiguration('missing', {}).product);
  assert.ok(validateConfiguration('produto-1', {text:'Olá', quantity:1, color:'inexistente'}).color);
});
