import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textOn, inkTone } from '../src/lib/color.ts';

test('textOn picks the higher-contrast text color', () => {
  assert.equal(textOn('#ffffff'), '#111111');
  assert.equal(textOn('#000000'), '#ffffff');
  assert.equal(textOn('#ffd500'), '#111111'); // yellow
  assert.equal(textOn('#e1000f'), '#ffffff'); // red
  assert.equal(textOn('#1d4ed8'), '#ffffff'); // blue
});

test('inkTone follows the text color', () => {
  assert.equal(inkTone('#ffeb00'), 'dark');
  assert.equal(inkTone('#0001b8'), 'light');
});
