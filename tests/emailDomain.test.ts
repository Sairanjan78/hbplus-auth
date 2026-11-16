import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesDomain } from '../src/lib/emailDomain.ts';

const D = 'hbplus.fit';

test('allows the official domain', () => {
  assert.equal(matchesDomain('example@hbplus.fit', D), true);
  assert.equal(matchesDomain('  Example@HBPLUS.fit ', D), true);
});

test('rejects other domains', () => {
  assert.equal(matchesDomain('example@gmail.com', D), false);
  assert.equal(matchesDomain('example@hbplus.fit.evil.com', D), false);
  assert.equal(matchesDomain('example@sub.hbplus.fit', D), false);
  assert.equal(matchesDomain('example@xhbplus.fit', D), false);
  assert.equal(matchesDomain('hbplus.fit@gmail.com', D), false);
});

test('rejects malformed input', () => {
  for (const v of ['', null, undefined, '@hbplus.fit', 'example@', 'no-at-sign']) {
    assert.equal(matchesDomain(v as any, D), false);
  }
});
