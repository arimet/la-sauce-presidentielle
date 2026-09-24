import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES } from '../src/lib/programme.ts';
import { THEMES as SCHEMA_THEMES } from '../src/schema.ts';

test('theme labels cover the schema themes in the same order', () => {
  assert.deepEqual(THEMES, [...SCHEMA_THEMES]);
});
