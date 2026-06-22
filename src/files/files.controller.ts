import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import type { Response } from 'express';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
  private readonly configService: ConfigService
  ) { }

  /**
   * @UseInterceptors(FileInterceptor('file'))
   * - Activa Multer (gestor de uploads en Express) mediante un interceptor de NestJS.
   * - Espera una petición multipart/form-data.
   * - El campo del formulario debe llamarse file (el string 'file' en FileInterceptor('file')).
   * - Procesa ese archivo antes de entrar al método del controlador.
   * 
   * updateFileProduct(@UploadedFile() file: Express.Multer.File)
   * Es el handler del endpoint:
   * - @UploadedFile() inyecta el archivo subido en el parámetro file.
   * - Express.Multer.File es el tipo con metadatos: originalname, mimetype, size,
   *   buffer (si está en memoria), path (si se guardó en disco), etc.
   */
  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/uploads',
      filename: fileNamer
    })
  }))
  updateFileProduct(@UploadedFile() file: Express.Multer.File) {
    // console.log({fileInController: file});
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return { secureUrl };
  }

  @Get('product/:imageName')
  findProduct(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {
    console.log(imageName);
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }
}
