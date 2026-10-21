/**
 * Seeded Pseudo-Random Number Generator using Mulberry32.
 * Ensures deterministic simulation runs across devices and save-loads.
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number = 1337) {
    this.seed = seed >>> 0;
  }

  /**
   * Returns a pseudo-random floating point number in [0, 1)
   */
  public next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a pseudo-random integer in [min, max] inclusive
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns true with probability p (0 to 1)
   */
  public chance(p: number): number {
    return this.next() < p ? 1 : 0;
  }

  public getSeed(): number {
    return this.seed;
  }

  public setSeed(seed: number): void {
    this.seed = seed >>> 0;
  }
}
