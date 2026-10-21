import { describe, it, expect } from 'vitest';
import { SeededRandom } from '../../src/core/random';

describe('SeededRandom PRNG', () => {
  it('should generate deterministic random values given the same seed', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);

    const values1 = [rng1.next(), rng1.next(), rng1.nextInt(1, 100)];
    const values2 = [rng2.next(), rng2.next(), rng2.nextInt(1, 100)];

    expect(values1).toEqual(values2);
  });

  it('should generate different values for different seeds', () => {
    const rng1 = new SeededRandom(100);
    const rng2 = new SeededRandom(200);

    expect(rng1.next()).not.toEqual(rng2.next());
  });

  it('should restore state correctly when seed is set', () => {
    const rng = new SeededRandom(12345);
    rng.next();
    const savedSeed = rng.getSeed();

    const val1 = rng.next();

    rng.setSeed(savedSeed);
    const val2 = rng.next();

    expect(val1).toEqual(val2);
  });
});
