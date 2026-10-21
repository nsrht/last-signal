import { GameState } from '../simulation/GameState';
import { EVENT_DEFINITIONS, EventDefinition } from '../data/events';
import { GameEvent } from '../core/types';

export class EventDirector {
  private lastEventTimeSec: number = 0;
  private minIntervalSec: number = 30; // Minimum seconds between random events

  public tick(state: GameState): void {
    if (state.isPaused || state.ending !== 'NONE') return;

    // Check cooldown interval
    if (state.simTimeSec - this.lastEventTimeSec < this.minIntervalSec) return;

    // Filter events applicable to current act
    const applicableEvents = EVENT_DEFINITIONS.filter(def => {
      if (def.minAct === 'ACT_2' && state.currentAct === 'ACT_1') return false;
      if (def.minAct === 'ACT_3' && (state.currentAct === 'ACT_1' || state.currentAct === 'ACT_2')) return false;
      return true;
    });

    for (const eventDef of applicableEvents) {
      if (state.rng.next() < eventDef.chancePerTick) {
        this.triggerEvent(state, eventDef);
        this.lastEventTimeSec = state.simTimeSec;
        break; // Only one event per check
      }
    }
  }

  public triggerEvent(state: GameState, eventDef: EventDefinition): void {
    eventDef.effect(state);

    const gameEvent: GameEvent = {
      id: `${eventDef.id}-${Date.now()}`,
      title: eventDef.title,
      description: eventDef.description,
      severity: eventDef.severity,
      systemId: eventDef.systemId,
      timestamp: state.simTimeSec,
      resolved: false,
      actionText: eventDef.actionText,
    };

    state.events.unshift(gameEvent);
    if (state.events.length > 20) state.events.pop();

    state.addLog(`[OLAY: ${eventDef.severity}] ${eventDef.title} — ${eventDef.description}`);
  }
}
