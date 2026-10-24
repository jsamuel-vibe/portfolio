import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCaseStudyView,
  readCaseStudyView,
  writeCaseStudyView,
  applyCaseStudyView,
  pauseAutoplayForReducedMotion
} from '../case-study-view.mjs';

test('normalizes unknown views to the hybrid default', () => {
  assert.equal(normalizeCaseStudyView('1'), '1');
  assert.equal(normalizeCaseStudyView('2'), '2');
  assert.equal(normalizeCaseStudyView('3'), '3');
  assert.equal(normalizeCaseStudyView('4'), '3');
  assert.equal(normalizeCaseStudyView(null), '3');
});

test('reads view from a query string', () => {
  assert.equal(readCaseStudyView('?view=1'), '1');
  assert.equal(readCaseStudyView('?source=portfolio&view=2'), '2');
  assert.equal(readCaseStudyView('?source=portfolio'), '3');
});

test('writes view without deleting unrelated query parameters', () => {
  assert.equal(writeCaseStudyView('?source=portfolio', '1'), '?source=portfolio&view=1');
  assert.equal(writeCaseStudyView('?view=1&source=portfolio', '2'), '?view=2&source=portfolio');
  assert.equal(writeCaseStudyView('', 'invalid'), '?view=3');
});

test('applies the normalized view and exposes one pressed button', () => {
  const root = { dataset: {} };
  const buttons = ['1', '2', '3'].map((choice) => ({
    dataset: { caseViewChoice: choice },
    attrs: {},
    setAttribute(name, value) { this.attrs[name] = value; }
  }));

  assert.equal(applyCaseStudyView(root, buttons, '2'), '2');
  assert.equal(root.dataset.caseView, '2');
  assert.deepEqual(buttons.map((button) => button.attrs['aria-pressed']), ['false', 'true', 'false']);
});

test('pauses autoplay media when reduced motion is requested', () => {
  const videos = [
    { removed: false, paused: false, removeAttribute() { this.removed = true; }, pause() { this.paused = true; } },
    { removed: false, paused: false, removeAttribute() { this.removed = true; }, pause() { this.paused = true; } }
  ];
  const doc = { querySelectorAll() { return videos; } };
  pauseAutoplayForReducedMotion(doc, false);
  assert.deepEqual(videos.map((video) => video.paused), [false, false]);
  pauseAutoplayForReducedMotion(doc, true);
  assert.deepEqual(videos.map((video) => [video.removed, video.paused]), [[true, true], [true, true]]);
});
