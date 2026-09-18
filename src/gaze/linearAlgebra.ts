/** Solves Ax = b via Gaussian elimination with partial pivoting. A is square. */
export function solveLinearSystem(matrixA: number[][], vectorB: number[]): number[] {
  const n = vectorB.length;
  const a = matrixA.map((row) => row.slice());
  const b = vectorB.slice();

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let pivotValue = Math.abs(a[col][col]);
    for (let row = col + 1; row < n; row++) {
      const value = Math.abs(a[row][col]);
      if (value > pivotValue) {
        pivotValue = value;
        pivotRow = row;
      }
    }
    if (pivotValue < 1e-10) {
      throw new Error('Matrix is singular or near-singular');
    }
    if (pivotRow !== col) {
      [a[col], a[pivotRow]] = [a[pivotRow], a[col]];
      [b[col], b[pivotRow]] = [b[pivotRow], b[col]];
    }

    for (let row = col + 1; row < n; row++) {
      const factor = a[row][col] / a[col][col];
      for (let k = col; k < n; k++) {
        a[row][k] -= factor * a[col][k];
      }
      b[row] -= factor * b[col];
    }
  }

  const x = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = b[row];
    for (let k = row + 1; k < n; k++) {
      sum -= a[row][k] * x[k];
    }
    x[row] = sum / a[row][row];
  }
  return x;
}

/**
 * Ridge-regularized least squares: minimizes ||X*theta - y||^2 + lambda*||theta||^2,
 * solved via the normal equations (X^T X + lambda*I) theta = X^T y.
 * Ridge regularization keeps the system solvable with few calibration samples.
 */
export function ridgeLeastSquares(designMatrix: number[][], targets: number[], lambda = 1e-3): number[] {
  const numFeatures = designMatrix[0].length;
  const xtx: number[][] = Array.from({ length: numFeatures }, () => new Array(numFeatures).fill(0));
  const xty: number[] = new Array(numFeatures).fill(0);

  for (const row of designMatrix) {
    for (let i = 0; i < numFeatures; i++) {
      for (let j = 0; j < numFeatures; j++) {
        xtx[i][j] += row[i] * row[j];
      }
    }
  }
  for (let i = 0; i < numFeatures; i++) {
    for (let sampleIdx = 0; sampleIdx < designMatrix.length; sampleIdx++) {
      xty[i] += designMatrix[sampleIdx][i] * targets[sampleIdx];
    }
    xtx[i][i] += lambda;
  }

  return solveLinearSystem(xtx, xty);
}
