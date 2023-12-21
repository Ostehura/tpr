import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { matrix } from './matrix';
import { respond } from './respond';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  multiplyMatrix(
    matrixA: number[][],
    matrixB: number[][],
    powA: number,
  ): number[][] {
    if (matrixA[0].length != matrixB.length) {
      throw new Error('Matrix have wrong sizes');
    }
    const result = Array(matrixA.length)
      .fill(0)
      .map(() => new Array(matrixB[0].length).fill(0));
    for (let i = 0; i < matrixA.length; i++) {
      for (let j = 0; j < matrixB[0].length; j++) {
        result[i][j] = 0;
        for (let k = 0; k < matrixB.length; ++k) {
          result[i][j] +=
            (powA == 1 ? matrixA[i][k] : matrixA[i][k] * matrixA[i][k]) *
            matrixB[k][j];
        }
      }
    }
    return result;
  }

  KryteriiBayesa(matrix: number[][], probabilities: number[][]): string[] {
    const sum = this.multiplyMatrix(matrix, probabilities, 1);
    let max = -1e9;
    let best = [];
    for (let i = 0; i < sum.length; i++) {
      if (Math.abs(max - sum[i][0]) < 1e-7) {
        best.push(i);
      } else if (max < sum[i][0]) {
        max = sum[i][0];
        best = [i];
      }
    }
    return best;
  }

  KryteriiMinDysp(matrix: number[][], probabilities: number[][]): string[] {
    const sum1 = this.multiplyMatrix(matrix, probabilities, 2);
    const sum2 = this.multiplyMatrix(matrix, probabilities, 1);
    let max = 1e9;
    let best = [];
    for (let i = 0; i < sum1.length; i++) {
      if (Math.abs(max - sum1[i][0] - sum2[i][0] * sum2[i][0]) < 1e-7) {
        best.push(i);
      } else if (max > sum1[i][0] - sum2[i][0] * sum2[i][0]) {
        max = sum1[i][0] - sum2[i][0] * sum2[i][0];
        best = [i];
      }
    }
    return best;
  }
  KryteriiModalnyi(matrix: number[][], probabilities: number[][]): string[] {
    let biggest = 0,
      m = 0;
    for (let i = 0; i < probabilities.length; i++) {
      if (Math.abs(probabilities[i][0] - m) < 1e-7) {
        return [];
      }
      if (probabilities[i][0] > m) {
        m = probabilities[i][0];
        biggest = i;
      }
    }
    let max = -1e9;
    let best = [];
    for (let i = 0; i < matrix.length; i++) {
      if (Math.abs(max - matrix[i][biggest]) < 1e-7) {
        best.push(i);
      } else if (max < matrix[i][biggest]) {
        max = matrix[i][biggest];
        best = [i];
      }
    }
    return best;
  }

  KryteriiMaksRozp(matrix: number[][], probabilities: number[][]): string[] {
    let avg = 0,
      mi = 1e9,
      ma = -1e9;
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[0].length; j++) {
        mi = Math.min(mi, matrix[i][j]);
        ma = Math.max(ma, matrix[i][j]);
      }
    }
    avg = (mi + ma) / 2;

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[0].length; j++) {
        if (matrix[i][j] >= avg) {
          matrix[i][j] = 1;
        } else {
          matrix[i][j] = 0;
        }
      }
    }

    const sum = this.multiplyMatrix(matrix, probabilities, 1);
    let max = -1e9;
    let best = [];
    for (let i = 0; i < sum.length; i++) {
      if (Math.abs(max - sum[i][0]) < 1e-7) {
        best.push(i);
      } else if (max < sum[i][0]) {
        max = sum[i][0];
        best = [i];
      }
    }
    return best;
  }
  KryteriiMaksyMaksa(matrix: number[][]): number[] {
    let max = -1e9,
      res = [] as number[];
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (Math.abs(matrix[i][j] - max) < 1e-7) {
          res.push(i);
        } else if (matrix[i][j] > max) {
          max = matrix[i][j];
          res = [i];
        }
      }
    }
    return res;
  }

  KryteriiMiniMaksa(matrix: number[][]): number[] {
    let max = -1e9,
      res = [] as number[];
    for (let i = 0; i < matrix.length; i++) {
      let min = 1e18;
      for (let j = 0; j < matrix[i].length; j++) {
        min = Math.min(min, matrix[i][j]);
      }
      if (Math.abs(min - max) < 1e-7) {
        res.push(i);
      } else if (min > max) {
        max = min;
        res = [i];
      }
    }
    return res;
  }

  KryteriiHurvitsa(matrix: number[][], alpha: number): number[] {
    let opt = -1e9,
      res = [] as number[];
    for (let i = 0; i < matrix.length; i++) {
      let min = 1e18,
        max = -1e18;
      for (let j = 0; j < matrix[i].length; j++) {
        min = Math.min(min, matrix[i][j]);
        max = Math.max(max, matrix[i][j]);
      }

      if (Math.abs(opt - alpha * max - (1 - alpha) * min) < 1e-7) {
        res.push(i);
      } else if (opt < alpha * max + (1 - alpha) * min) {
        opt = alpha * max + (1 - alpha) * min;
        res = [i];
      }
    }
    return res;
  }

  KryteriiSevidzha(matrix: number[][]): number[] {
    const y = [] as number[];
    for (let i = 0; i < matrix[0].length; i++) {
      y.push(-1e9);
      for (let j = 0; j < matrix.length; j++) {
        y[i] = Math.max(y[i], matrix[j][i]);
      }
    }
    let min = 1e18;
    let res = [] as number[];
    for (let i = 0; i < matrix.length; i++) {
      let localmax = -1e18;
      for (let j = 0; j < matrix[0].length; j++) {
        localmax = Math.max(localmax, y[j] - matrix[i][j]);
      }
      if (Math.abs(min - localmax) < 1e-7) {
        res.push(i);
      } else if (min > localmax) {
        min = localmax;
        res = [i];
      }
    }
    return res;
  }

  processMatrix(matrix: matrix): respond {
    try {
      const n = matrix.matrixValues.length;
      const m = matrix.matrixValues[0].length;
      const matrixValues = [] as number[][];
      const probabilities = [] as number[][];
      const results = [] as string[][];
      let number = 0;
      for (let i = 0; i < n; i++) {
        matrixValues.push([]);
        results.push([]);
        for (let j = 0; j < m; j++) {
          matrixValues[i].push(Number.parseFloat(matrix.matrixValues[i][j]));
        }
      }
      if (matrix.detrmined) {
        for (let i = 0; i < m; i++) {
          probabilities.push([Number.parseFloat(matrix.probabilities[i])]);
          if (probabilities[i][0] < 0) {
            return { error: `Від'ємні ймовірності`, results: [] };
          }
          number += probabilities[i][0];
        }
        if (Math.abs(1 - number) > 1e-7) {
          return { error: 'Сума ймовірностей не рівна 1', results: [] };
        }

        this.KryteriiBayesa(matrixValues, probabilities).forEach((x) =>
          results[x].push('Критерій Байєсса'),
        );
        this.KryteriiMinDysp(matrixValues, probabilities).forEach((x) =>
          results[x].push('Критерій мінімізації дисперсії '),
        );
        this.KryteriiMaksRozp(matrixValues, probabilities).forEach((x) =>
          results[x].push('Критерій максимізації ймовірності розподілу оцінок'),
        );
        this.KryteriiModalnyi(matrixValues, probabilities).forEach((x) =>
          results[x].push('Критерій модальний'),
        );
        return {
          error: '',
          results: results,
        };
      } else {
        if (matrix.alphaHurvitsa > 1 || matrix.alphaHurvitsa < 0) {
          return {
            error: `Альфа має бути у діапазоні від 0 до 1`,
            results: [],
          };
        }
        this.KryteriiMaksyMaksa(matrixValues).forEach((x) =>
          results[x].push('Критерій "максимакса"'),
        );
        this.KryteriiMiniMaksa(matrixValues).forEach((x) =>
          results[x].push('Мінімаксний критерій'),
        );
        console.log(matrix.alphaHurvitsa);
        this.KryteriiHurvitsa(matrixValues, matrix.alphaHurvitsa).forEach((x) =>
          results[x].push('Критерій Гурвіца'),
        );
        this.KryteriiSevidzha(matrixValues).forEach((x) =>
          results[x].push('Критерій Севіджа'),
        );
      }
      return { error: '', results: results };
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
