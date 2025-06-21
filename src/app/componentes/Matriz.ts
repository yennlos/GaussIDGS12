export interface UserStep {
  stepNumber: number;
  operation: string;  
  matrix: number[][]; // Matriz resultante
}

export interface MatrixSolution {
  solutions: number[];
  steps: {
    description: string;
    matrix: number[][];
  }[];
  error?: string;
}

export const formatMatrix = (matrix: number[][]): string => {
  return matrix.map(row => {
    const coeffs = row.slice(0, -1).map(num => num.toFixed(2).padStart(6));
    const constant = row[row.length - 1].toFixed(2).padStart(6);
    return `[ ${coeffs.join(' ')} | ${constant} ]`;
  }).join('\n');
};

export const formatMatrixForDisplay = (matrix: number[][]): string => {
  return matrix.map(row => {
    const coefficients = row.slice(0, -1).map(num => num.toFixed(2).padStart(6));
    const constant = row[row.length - 1].toFixed(2).padStart(6);
    return `[ ${coefficients.join(' ')} | ${constant} ]`;
  }).join('\n');
};

export const gaussElimination = (matrix: number[][]): MatrixSolution => {
  const steps: {
    description: string;
    matrix: number[][];
  }[] = [];
  const n = matrix.length;
  const augmentedMatrix = matrix.map(row => [...row]);
  
  steps.push({
    description: "Matriz inicial",
    matrix: matrix.map(row => [...row]) // Copia profunda
  });

  for (let i = 0; i < n; i++) {
    // Pivoteo parcial
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmentedMatrix[k][i]) > Math.abs(augmentedMatrix[maxRow][i])) {
        maxRow = k;
      }
    }
    
    if (maxRow !== i) {
      [augmentedMatrix[i], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[i]];
      steps.push({
        description: `Intercambio F${i+1} ↔ F${maxRow+1}`,
        matrix: augmentedMatrix.map(row => [...row])
      });
    }

    // Normalización
    const pivot = augmentedMatrix[i][i];
    if (Math.abs(pivot) < 1e-10) {
      return {
        solutions: [],
        steps,
        error: "Sistema singular"
      };
    }

    for (let j = i; j < n + 1; j++) {
      augmentedMatrix[i][j] /= pivot;
    }
    steps.push({
      description: `F${i+1} → F${i+1} / ${pivot.toFixed(2)}`,
      matrix: augmentedMatrix.map(row => [...row])
    });

    // Eliminación
    for (let k = 0; k < n; k++) {
      if (k !== i && Math.abs(augmentedMatrix[k][i]) > 1e-10) {
        const factor = augmentedMatrix[k][i];
        for (let j = i; j < n + 1; j++) {
          augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
        }
        steps.push({
          description: `F${k+1} → F${k+1} - (${factor.toFixed(2)})×F${i+1}`,
          matrix: augmentedMatrix.map(row => [...row])
        });
      }
    }
  }

  // Sustitución hacia atrás
  const solutions = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    solutions[i] = augmentedMatrix[i][n];
    for (let j = i + 1; j < n; j++) {
      solutions[i] -= augmentedMatrix[i][j] * solutions[j];
    }
    solutions[i] /= augmentedMatrix[i][i];
  }

  return { solutions, steps };
};

export const validateSteps = (
  userSteps: UserStep[],
  correctSteps: MatrixSolution['steps']
): { isValid: boolean; feedback: string[] } => {
  const feedback: string[] = [];
  let isValid = true;

  if (userSteps.length !== correctSteps.length) {
    return {
      isValid: false,
      feedback: [`Número incorrecto de pasos. Esperados: ${correctSteps.length}, Recibidos: ${userSteps.length}`]
    };
  }

  userSteps.forEach((userStep, index) => {
    const correctStep = correctSteps[index];
    const matrixMatch = userStep.matrix.every((row, i) =>
      row.every((val, j) => Math.abs(val - correctStep.matrix[i][j]) < 0.01)
    );

    if (!matrixMatch) {
      isValid = false;
      feedback.push(`❌ Paso ${index + 1}: La matriz no coincide con el resultado esperado`);
      feedback.push(`  Esperado:\n${formatMatrix(correctStep.matrix)}`);
      feedback.push(`  Recibido:\n${formatMatrix(userStep.matrix)}`);
    } else if (userStep.operation !== correctStep.description) {
      feedback.push(`⚠ Paso ${index + 1}: Operación correcta pero descripción diferente`);
      feedback.push(`  Esperado: ${correctStep.description}`);
      feedback.push(`  Recibido: ${userStep.operation}`);
    } else {
      feedback.push(`✓ Paso ${index + 1}: Correcto - ${userStep.operation}`);
    }
  });

  return { isValid, feedback };
};

