export interface ClassStats {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

export function calculateStatistics(marks: number[]): ClassStats {
  if (marks.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
    };
  }

  const sorted = [...marks].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = parseFloat((sum / count).toFixed(2));

  // Median
  const mid = Math.floor(count / 2);
  const median =
    count % 2 === 0
      ? parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2))
      : parseFloat(sorted[mid].toFixed(2));

  const min = sorted[0];
  const max = sorted[count - 1];

  // Population Standard Deviation
  const variance =
    sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const stdDev = parseFloat(Math.sqrt(variance).toFixed(2));

  return {
    count,
    mean,
    median,
    min,
    max,
    stdDev,
  };
}
