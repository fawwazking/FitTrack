import {
  detectSetPrs,
  isVolumePr,
  planNextSession,
  roundToIncrement,
  sessionVolume,
} from '../src/domain/progression';

const base = {
  repMin: 6,
  repMax: 10,
  incrementKg: 2.5,
  daysSinceLastSession: 3,
  consecutiveBelowMin: 0,
  e1rmStallSessions: 0,
};

describe('double progression (PRD 7.8)', () => {
  it('adds load when every set hits the top of the range with RPE <= 9', () => {
    const plan = planNextSession({
      ...base,
      lastSets: [
        { weightKg: 80, reps: 10, rpe: 9 },
        { weightKg: 80, reps: 10, rpe: 8 },
      ],
    });
    expect(plan.action).toBe('increase');
    expect(plan.weightKg).toBe(82.5);
    expect(plan.targetReps).toBe(6);
    expect(plan.reason).toBe('increaseAllMax');
  });

  it('keeps the load and adds one rep when sets are inside the range', () => {
    const plan = planNextSession({
      ...base,
      lastSets: [
        { weightKg: 80, reps: 8 },
        { weightKg: 80, reps: 7 },
      ],
    });
    expect(plan.action).toBe('hold_add_rep');
    expect(plan.weightKg).toBe(80);
    expect(plan.targetReps).toBe(8);
    expect(plan.reason).toBe('addRep');
  });

  it('holds the load when one set falls below the minimum', () => {
    const plan = planNextSession({
      ...base,
      lastSets: [
        { weightKg: 80, reps: 8 },
        { weightKg: 80, reps: 5 },
      ],
    });
    expect(plan.action).toBe('hold');
    expect(plan.weightKg).toBe(80);
    expect(plan.reason).toBe('holdBelowMinOnce');
  });

  it('reduces 10% when two sessions in a row fall below the minimum', () => {
    const plan = planNextSession({
      ...base,
      consecutiveBelowMin: 1,
      lastSets: [{ weightKg: 80, reps: 5 }],
    });
    expect(plan.action).toBe('reduce');
    expect(plan.weightKg).toBe(72.5);
    expect(plan.reason).toBe('reduceBelowMinTwice');
  });

  it('never increases when a set reached RPE 10', () => {
    const plan = planNextSession({
      ...base,
      lastSets: [
        { weightKg: 80, reps: 10, rpe: 10 },
        { weightKg: 80, reps: 10, rpe: 9.5 },
      ],
    });
    expect(plan.action).toBe('hold');
    expect(plan.weightKg).toBe(80);
    expect(plan.reason).toBe('holdRpe10');
  });

  it('deloads 10% when e1RM stalled for three sessions', () => {
    const plan = planNextSession({
      ...base,
      e1rmStallSessions: 3,
      lastSets: [{ weightKg: 80, reps: 8 }],
    });
    expect(plan.action).toBe('deload');
    expect(plan.weightKg).toBe(72.5);
    expect(plan.reason).toBe('deloadStalled');
  });

  it('restarts at 90% after 14 days off', () => {
    const plan = planNextSession({
      ...base,
      daysSinceLastSession: 14,
      lastSets: [{ weightKg: 100, reps: 8 }],
    });
    expect(plan.action).toBe('restart_90');
    expect(plan.weightKg).toBe(90);
    expect(plan.reason).toBe('layoffRestart');
  });

  it('ignores warmup sets', () => {
    const plan = planNextSession({
      ...base,
      lastSets: [
        { weightKg: 40, reps: 10, isWarmup: true },
        { weightKg: 80, reps: 8 },
      ],
    });
    expect(plan.weightKg).toBe(80);
    expect(plan.action).toBe('hold_add_rep');
  });
});

describe('rounding', () => {
  it('rounds to the nearest increment', () => {
    expect(roundToIncrement(72, 2.5)).toBe(72.5);
    expect(roundToIncrement(91, 5)).toBe(90);
  });
});

describe('personal records (PRD 7.9)', () => {
  const history = [
    { weightKg: 80, reps: 8 },
    { weightKg: 80, reps: 7 },
    { weightKg: 75, reps: 12 },
  ];

  it('detects reps and e1RM PRs', () => {
    const prs = detectSetPrs([{ weightKg: 80, reps: 8 }, { weightKg: 80, reps: 7 }], {
      weightKg: 80,
      reps: 9,
    });
    expect(prs).toContain('reps');
    expect(prs).toContain('e1rm');
    expect(prs).not.toContain('weight');
  });

  it('does not call a high-rep set an e1RM PR when an earlier e1RM was higher', () => {
    expect(detectSetPrs(history, { weightKg: 80, reps: 9 })).not.toContain('e1rm');
  });

  it('detects a load PR', () => {
    const prs = detectSetPrs(history, { weightKg: 85, reps: 5 });
    expect(prs).toContain('weight');
  });

  it('does not flag an equal set', () => {
    expect(detectSetPrs(history, { weightKg: 80, reps: 8 })).toEqual([]);
  });

  it('ignores warmup sets and the first ever set', () => {
    expect(detectSetPrs(history, { weightKg: 120, reps: 5, isWarmup: true })).toEqual([]);
    expect(detectSetPrs([], { weightKg: 120, reps: 5 })).toEqual([]);
  });

  it('computes session volume and volume PRs', () => {
    expect(sessionVolume([{ weightKg: 80, reps: 8 }, { weightKg: 80, reps: 8, isWarmup: true }])).toBe(640);
    expect(isVolumePr(600, 640)).toBe(true);
    expect(isVolumePr(640, 640)).toBe(false);
  });
});
