import assert from 'node:assert/strict';
import test from 'node:test';
import { GAME_CONFIG } from './config';
import { GPU_STAGES, TOTAL_COMPONENT_COUNT } from './content/stages';
import { createInitialSession, sessionReducer } from './session';
import type { SessionState } from './types';
import { createGameplayViewModel } from './ui-contract';

function startStage(state: SessionState) {
  return sessionReducer(state, { type: 'START_STAGE' });
}

function completeCurrentStage(state: SessionState) {
  let next = state.phase === 'STAGE_INTRO' ? startStage(state) : state;
  for (const componentId of GPU_STAGES[next.stageIndex].componentIds) {
    next = sessionReducer(next, { type: 'SELECT_COMPONENT', componentId });
  }
  return next;
}

void test('initial session exposes the first stage without progress', () => {
  const state = createInitialSession();
  const view = createGameplayViewModel(state);
  assert.equal(view.phase, 'STAGE_INTRO');
  assert.equal(view.stageIndex, 0);
  assert.equal(view.installedTotal, 0);
  assert.equal(view.totalComponentCount, 21);
  assert.equal(view.activeComponentId, GPU_STAGES[0].componentIds[0]);
  assert.equal(view.canStartStage, true);
});

void test('correct first attempt awards placement points and bonus', () => {
  const started = startStage(createInitialSession());
  const state = sessionReducer(started, { type: 'SELECT_COMPONENT', componentId: GPU_STAGES[0].componentIds[0] });
  assert.equal(state.score, GAME_CONFIG.startingScore + GAME_CONFIG.correctPlacement + GAME_CONFIG.firstAttemptBonus);
  assert.equal(state.installedIds.length, 1);
  assert.equal(state.attemptsForSocket, 0);
});

void test('incorrect attempt applies a penalty and removes the first-attempt bonus', () => {
  const started = startStage(createInitialSession());
  const wrongId = GPU_STAGES[0].componentIds[1];
  const rejected = sessionReducer(started, { type: 'SELECT_COMPONENT', componentId: wrongId });
  assert.equal(rejected.score, GAME_CONFIG.startingScore - GAME_CONFIG.incorrectPlacement);
  assert.equal(rejected.installedIds.length, 0);
  assert.equal(rejected.wrongId, wrongId);

  const corrected = sessionReducer(rejected, { type: 'SELECT_COMPONENT', componentId: GPU_STAGES[0].componentIds[0] });
  assert.equal(corrected.score, GAME_CONFIG.startingScore);
  assert.equal(corrected.installedIds.length, 1);
});

void test('score reaching zero enters the failure state', () => {
  let state = startStage(createInitialSession());
  const wrongId = GPU_STAGES[0].componentIds[1];
  for (let attempt = 0; attempt < GAME_CONFIG.startingScore / GAME_CONFIG.incorrectPlacement; attempt += 1) {
    state = sessionReducer(state, { type: 'SELECT_COMPONENT', componentId: wrongId });
  }
  assert.equal(state.score, 0);
  assert.equal(state.phase, 'FAILED');
});

void test('all stages preserve score and finish the 21-component mission', () => {
  let state = createInitialSession();
  for (let stageIndex = 0; stageIndex < GPU_STAGES.length; stageIndex += 1) {
    state = completeCurrentStage(state);
    assert.equal(state.phase, 'STAGE_COMPLETE');
    assert.equal(state.stageIndex, stageIndex);
    state = sessionReducer(state, { type: 'NEXT_STAGE' });
  }

  const expectedScore = GAME_CONFIG.startingScore
    + TOTAL_COMPONENT_COUNT * (GAME_CONFIG.correctPlacement + GAME_CONFIG.firstAttemptBonus)
    + GPU_STAGES.length * GAME_CONFIG.stageCompletionBonus;
  assert.equal(state.phase, 'MISSION_COMPLETE');
  assert.equal(state.score, expectedScore);
  assert.equal(state.installedIds.length, TOTAL_COMPONENT_COUNT);
  assert.equal(createGameplayViewModel(state).overallProgress, 1);
});

void test('UI contract marks installed and rejected choices without exposing reducer internals', () => {
  const started = startStage(createInitialSession());
  const correctId = GPU_STAGES[0].componentIds[0];
  const installed = sessionReducer(started, { type: 'SELECT_COMPONENT', componentId: correctId });
  const wrongId = GPU_STAGES[0].componentIds[2];
  const rejected = sessionReducer(installed, { type: 'SELECT_COMPONENT', componentId: wrongId });
  const view = createGameplayViewModel(rejected);
  assert.equal(view.choices.find((choice) => choice.id === correctId)?.disabled, true);
  assert.equal(view.choices.find((choice) => choice.id === wrongId)?.rejected, true);
  assert.equal(view.activeComponentId, GPU_STAGES[0].componentIds[1]);
});
