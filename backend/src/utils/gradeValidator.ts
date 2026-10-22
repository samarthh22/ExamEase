export interface BoundaryInput {
  gradeLabel: string;
  lowerBound: number;
  upperBound: number;
}

export interface BoundaryValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates grading boundaries for an examination with maxMarks.
 * Convention:
 * - Boundaries are sorted in ascending order of lowerBound.
 * - The lowest boundary must have lowerBound === 0.
 * - The highest boundary must have upperBound === maxMarks.
 * - Each boundary must have lowerBound < upperBound.
 * - For consecutive intervals [L_i, U_i] and [L_{i+1}, U_{i+1}], U_i must equal L_{i+1} (or integer adjacent U_i + 1 == L_{i+1}).
 * - Evaluation convention: A mark M falls in boundary if L <= M < U, except for the top boundary where M == maxMarks is also included.
 */
export function validateGradingBoundaries(
  boundaries: BoundaryInput[],
  maxMarks: number
): BoundaryValidationResult {
  const errors: string[] = [];

  if (!boundaries || boundaries.length === 0) {
    return { isValid: false, errors: ['At least one grading boundary must be defined.'] };
  }

  // Check unique grade labels
  const labelSet = new Set<string>();
  for (const b of boundaries) {
    const label = b.gradeLabel.trim();
    if (!label) {
      errors.push('Grade label cannot be empty.');
    }
    if (labelSet.has(label)) {
      errors.push(`Duplicate grade label detected: "${label}".`);
    }
    labelSet.add(label);
  }

  // Check each boundary validity
  for (const b of boundaries) {
    if (b.lowerBound < 0) {
      errors.push(`Boundary "${b.gradeLabel}" lower bound cannot be negative (${b.lowerBound}).`);
    }
    if (b.upperBound > maxMarks) {
      errors.push(`Boundary "${b.gradeLabel}" upper bound (${b.upperBound}) exceeds maximum marks (${maxMarks}).`);
    }
    if (b.lowerBound >= b.upperBound) {
      errors.push(`Boundary "${b.gradeLabel}" lower bound (${b.lowerBound}) must be strictly less than upper bound (${b.upperBound}).`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Sort by lowerBound ascending
  const sorted = [...boundaries].sort((a, b) => a.lowerBound - b.lowerBound);

  // Check start at 0
  if (sorted[0].lowerBound !== 0) {
    errors.push(`The lowest grading boundary must start at 0 (currently starts at ${sorted[0].lowerBound}).`);
  }

  // Check end at maxMarks
  const lastIndex = sorted.length - 1;
  if (sorted[lastIndex].upperBound !== maxMarks) {
    errors.push(`The highest grading boundary must end at maximum marks ${maxMarks} (currently ends at ${sorted[lastIndex].upperBound}).`);
  }

  // Check gaps and overlaps between adjacent boundaries
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (current.upperBound < next.lowerBound) {
      errors.push(
        `Gap detected between "${current.gradeLabel}" (ends at ${current.upperBound}) and "${next.gradeLabel}" (starts at ${next.lowerBound}). Every mark must map to a grade.`
      );
    } else if (current.upperBound > next.lowerBound) {
      errors.push(
        `Overlap detected between "${current.gradeLabel}" (ends at ${current.upperBound}) and "${next.gradeLabel}" (starts at ${next.lowerBound}). Ranges must not overlap.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function determineGrade(
  marksObtained: number,
  boundaries: BoundaryInput[],
  maxMarks: number
): string | null {
  if (marksObtained < 0 || marksObtained > maxMarks) {
    return null;
  }

  const sorted = [...boundaries].sort((a, b) => a.lowerBound - b.lowerBound);
  for (let i = 0; i < sorted.length; i++) {
    const b = sorted[i];
    const isTopBoundary = i === sorted.length - 1;

    // For standard boundary: L <= M < U
    // For top boundary: L <= M <= U
    if (isTopBoundary) {
      if (marksObtained >= b.lowerBound && marksObtained <= b.upperBound) {
        return b.gradeLabel;
      }
    } else {
      if (marksObtained >= b.lowerBound && marksObtained < b.upperBound) {
        return b.gradeLabel;
      }
    }
  }

  return null;
}
