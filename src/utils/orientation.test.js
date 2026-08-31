import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldShowOrientationWarning } from './orientation.js';

test('mostra aviso em mobile e tablet em retrato', () => {
  assert.equal(shouldShowOrientationWarning({ width: 390, height: 844, isPortrait: true }), true);
  assert.equal(shouldShowOrientationWarning({ width: 768, height: 1024, isPortrait: true }), true);
});

test('oculta aviso em desktop ou landscape', () => {
  assert.equal(shouldShowOrientationWarning({ width: 1280, height: 800, isPortrait: false }), false);
  assert.equal(shouldShowOrientationWarning({ width: 900, height: 600, isPortrait: true }), false);
});
