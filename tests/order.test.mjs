import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { sessionOrder } from '../src/lib/order.js';

const store = new Map();
globalThis.sessionStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
};
beforeEach(() => store.clear());

test('shuffles once, then keeps the stored order', () => {
  const slugs = ['a', 'b', 'c', 'd', 'e'];
  const first = sessionOrder(slugs);
  assert.deepEqual([...first].sort(), slugs);
  assert.deepEqual(sessionOrder(slugs), first);
});

test('drops unknown slugs and appends new ones', () => {
  store.set('ls-order', JSON.stringify(['c', 'gone', 'a', 'c', 42]));
  const order = sessionOrder(['a', 'b', 'c']);
  assert.deepEqual(order.slice(0, 2), ['c', 'a']);
  assert.equal(order[2], 'b');
});

test('without a stored order, create=false keeps the given order', () => {
  assert.deepEqual(sessionOrder(['a', 'b'], false), ['a', 'b']);
  assert.equal(store.size, 0);
});

test('falls back to a fresh shuffle when storage throws', () => {
  const saved = globalThis.sessionStorage;
  globalThis.sessionStorage = { getItem() { throw new Error(); }, setItem() { throw new Error(); } };
  try {
    assert.deepEqual(sessionOrder(['a', 'b', 'c']).sort(), ['a', 'b', 'c']);
  } finally {
    globalThis.sessionStorage = saved;
  }
});
