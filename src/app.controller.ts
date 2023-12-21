import {
  Body,
  Controller,
  Get,
  Render,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Express } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { matrix } from './matrix';
import { respond } from './respond';
import { FileInterceptor } from '@nestjs/platform-express';
import { filebody } from './filebody';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  mainPage(): string {
    return;
  }

  @Get('file')
  @Render('file')
  filePage(): string {
    return;
  }

  @Post('process')
  processMatrix(@Body() matrix: matrix): respond {
    return this.appService.processMatrix(matrix);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  uploadFile(
    @Body() body: filebody,
    @UploadedFile() file: Express.Multer.File,
  ): respond & { matrix: string[][] } {
    const fileText = file.buffer.toString().split('\n') as string[];
    const probabilities = [] as string[];
    const matrix = [] as string[][];
    const determined = body.detrmined == 'true';
    const alphaHurvitsa = Number.parseFloat(body.alphaHurvitsa);
    if (determined) {
      const pb = fileText[0].split(' ');
      for (let i = 0; i < pb.length; i++) {
        probabilities.push(pb[i]);
      }
    }
    for (let j = determined ? 1 : 0; j < fileText.length; j++) {
      matrix.push([]);
      const nums = fileText[j].split(' ');
      for (let i = 0; i < nums.length; i++) {
        matrix[matrix.length - 1].push(nums[i]);
      }
    }
    let valid = true;
    for (let j = 1; j < matrix.length; j++) {
      if (
        matrix[j - 1].length != matrix[j].length ||
        (determined && matrix[j].length != probabilities.length)
      ) {
        valid = false;
      }
    }
    if (!valid) {
      return { error: 'не коректний формат файла', results: [], matrix: [] };
    }
    const respond = this.appService.processMatrix({
      matrixValues: matrix,
      detrmined: determined,
      probabilities: probabilities,
      alphaHurvitsa: alphaHurvitsa,
    });

    return { results: respond.results, error: respond.error, matrix: matrix };
  }
}
