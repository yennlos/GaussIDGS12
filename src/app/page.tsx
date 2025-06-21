/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Image from "next/image";
import { useState } from "react";
import {
  gaussElimination,
  MatrixSolution,
  UserStep,
  formatMatrix,
} from "./componentes/Matriz";

export default function Home() {
  const matrixSize = 4;
  const [matrix, setMatrix] = useState<number[][]>(
    Array.from({ length: matrixSize }, () => [...Array(matrixSize).fill(0), 0])
  );
  const [currentUserMatrix, setCurrentUserMatrix] = useState<number[][]>(
    Array.from({ length: matrixSize }, () => [...Array(matrixSize + 1).fill(0)])
  );
  const [showMatrix, setShowMatrix] = useState(false);
  const [solutions, setSolutions] = useState<MatrixSolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStepToValidate, setCurrentStepToValidate] = useState<number>(0);
  const [userSteps, setUserSteps] = useState<UserStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    feedback: string[];
  } | null>(null);

  const handleInputChange = (row: number, col: number, value: string) => {
    const intValue = parseInt(value, 10);
    const newMatrix = [...matrix];
    newMatrix[row][col] = isNaN(intValue) ? 0 : intValue;
    setMatrix(newMatrix);
  };

  const handleConstantChange = (row: number, value: string) => {
    const intValue = parseInt(value, 10);
    const newMatrix = [...matrix];
    newMatrix[row][matrixSize] = isNaN(intValue) ? 0 : intValue;
    setMatrix(newMatrix);
  };

  const agregarMatriz = () => {
    setMatrix([...matrix, [...Array(matrixSize).fill(0), 0]]);
  };

  const handleAddStep = () => {
    if (!solutions || currentStep >= solutions.steps.length) return;

    const newStep: UserStep = {
      stepNumber: currentStepToValidate, // Usa el número de paso correcto
      matrix: matrix.map((row) => [...row]),
      operation: solutions.steps[currentStepToValidate].description,
    };

    setUserSteps([...userSteps, newStep]);
    setCurrentStep(currentStep + 1);
  };

  const validateAllSteps = () => {
    if (!solutions) return;

    const feedback: string[] = [];
    let allCorrect = true;

    userSteps.forEach((userStep) => {
      const correctStep = solutions.steps[userStep.stepNumber];
      const isCorrect = userStep.matrix.every((row, i) =>
        row.every((val, j) => Math.abs(val - correctStep.matrix[i][j]) < 0.01)
      );

      if (!isCorrect) {
        allCorrect = false;
        feedback.push(`❌ Paso ${userStep.stepNumber + 1} incorrecto`);
        feedback.push(`  Operación: ${correctStep.description}`);
        feedback.push(`  Esperado:\n${formatMatrix(correctStep.matrix)}`);
        feedback.push(`  Ingresado:\n${formatMatrix(userStep.matrix)}`);
      } else {
        feedback.push(`✓ Paso ${userStep.stepNumber + 1} correcto`);
      }
    });

    setValidationResult({
      isValid: allCorrect,
      feedback,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSolutions(null);
    setUserSteps([]);
    setCurrentStep(0);
    setValidationResult(null);

    try {
      const result = gaussElimination(matrix);
      setSolutions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/Gauusapp.png"
          alt="Logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 mb-8 space-y-2">
          <li>Ingresa tu sistema de ecuaciones</li>
          <li>Dale clic en resolver cuando termines</li>
        </ol>

        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
        >
          {showMatrix ? "Ocultar" : "Iniciar"}
        </button>

        {showMatrix && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="overflow-x-auto">
              <table className="mx-auto border-collapse">
                <tbody>
                  {matrix.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.slice(0, matrixSize).map((cell, colIndex) => (
                        <td key={colIndex} className="p-1">
                          <input
                            type="number"
                            step="1"
                            className="w-16 h-10 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={cell}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                colIndex,
                                e.target.value
                              )
                            }
                          />
                          {colIndex === matrixSize - 1 && (
                            <span className="mx-2 text-gray-400">|</span>
                          )}
                        </td>
                      ))}
                      <td className="px-2">
                        <input
                          type="number"
                          step="1"
                          className="w-16 h-10 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={row[matrixSize]}
                          onChange={(e) =>
                            handleConstantChange(rowIndex, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={agregarMatriz}
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
              >
                Agregar ecuación
              </button>
              <button
                type="submit"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                Resolver Sistema
              </button>
            </div>
          </form>
        )}

        {solutions && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Validación Paso a Paso
            </h2>

            <div className="mb-4">
              <h3 className="text-lg text-white mb-2">
                Paso {currentStepToValidate + 1} de {solutions.steps.length}
              </h3>
              <p className="text-gray-300 mb-4">
                {solutions.steps[currentStepToValidate].description}
              </p>

              <div className="overflow-x-auto mb-4">
                <table className="mx-auto border-collapse">
                  <tbody>
                    {currentUserMatrix.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="p-1">
                            <input
                              type="number"
                              step="0.01"
                              className="w-16 h-10 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={cell}
                              onChange={(e) => {
                                const newMatrix = [...currentUserMatrix];
                                newMatrix[rowIndex][colIndex] =
                                  parseFloat(e.target.value) || 0;
                                setCurrentUserMatrix(newMatrix);
                              }}
                            />
                            {colIndex === matrixSize - 1 && (
                              <span className="mx-2 text-gray-400">|</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    // Agregar el paso actual a la lista de pasos del usuario
                    setUserSteps([
                      ...userSteps,
                      {
                        stepNumber: currentStepToValidate,
                        matrix: currentUserMatrix.map((row) => [...row]),
                        operation: "",
                      },
                    ]);

                    // Pasar al siguiente paso o validar si es el último
                    if (currentStepToValidate < solutions.steps.length - 1) {
                      setCurrentStepToValidate(currentStepToValidate + 1);
                      setCurrentUserMatrix(
                        solutions.steps[currentStepToValidate + 1].matrix.map(
                          (row) => [...row]
                        )
                      );
                    } else {
                      validateAllSteps();
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {currentStepToValidate < solutions.steps.length - 1
                    ? "Siguiente Paso"
                    : "Validar Todos los Pasos"}
                </button>
              </div>
            </div>
          </div>
        )}
        {validationResult && (
          <div
            className={`mt-6 p-4 rounded-md ${
              validationResult.isValid ? "bg-green-900/30" : "bg-red-900/30"
            }`}
          >
            <h3 className="text-xl font-semibold mb-2 text-white">
              {validationResult.isValid
                ? "✅ Todos los pasos son correctos"
                : "❌ Se encontraron errores"}
            </h3>
            <div className="space-y-2">
              {validationResult.feedback.map((message, i) => (
                <div
                  key={i}
                  className={
                    message.startsWith("✓")
                      ? "text-green-400"
                      : message.startsWith("❌")
                      ? "text-red-400"
                      : "text-gray-300"
                  }
                >
                  {message.split("\n").map((line, j) => (
                    <div key={j} className="font-mono text-sm">
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.matematicasonline.es/cidead/libros/2Bach_Mat_II/ejercicios_resueltos/Sistemas_ecuaciones.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Aprender
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.superprof.es/apuntes/escolar/matematicas/algebralineal/sistemas/ejercicios-del-metodo-de-gauss.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Ejercicios
        </a>
      </footer>
    </div>
  );
}
