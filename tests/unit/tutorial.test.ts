import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/simulation/GameState';
import { TutorialManager } from '../../src/narrative/TutorialManager';

describe('TutorialManager Unit Tests', () => {
  let state: GameState;
  let tutorial: TutorialManager;

  beforeEach(() => {
    state = new GameState(1337, 'normal');
    tutorial = new TutorialManager();
  });

  it('should initialize at step 1', () => {
    expect(tutorial.currentStepIndex).toBe(0);
    expect(tutorial.getCurrentStep()?.title).toContain('1/8');
  });

  it('should advance step when completion condition is met', () => {
    expect(tutorial.currentStepIndex).toBe(0);
    state.simTimeSec = 305.0;
    tutorial.tick(state);
    expect(tutorial.currentStepIndex).toBe(1);
  });

  it('should allow skipping tutorial', () => {
    tutorial.skip();
    expect(tutorial.isActive).toBe(false);
    expect(tutorial.isCompleted).toBe(true);
    expect(tutorial.getCurrentStep()).toBeNull();
  });

  it('should serialize and deserialize tutorial state faithfully', () => {
    tutorial.currentStepIndex = 3;
    const serialized = tutorial.serialize();

    const newTutorial = new TutorialManager();
    newTutorial.deserialize(serialized);

    expect(newTutorial.currentStepIndex).toBe(3);
  });
});
