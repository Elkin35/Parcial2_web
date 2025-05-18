import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ReseñaService } from './reseña.service';
import { CreateReseñaDto } from './dto/create-reseña.dto';
import { UpdateReseñaDto } from './dto/update-reseña.dto';

@Controller('reseñas') // Plural
export class ReseñaController {
  constructor(private readonly reseñaService: ReseñaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  agregarReseña(@Body() createReseñaDto: CreateReseñaDto) {
    return this.reseñaService.agregarReseña(createReseñaDto);
  }

  @Get()
  findAll() {
    return this.reseñaService.findAll();
  }

  @Get(':id')
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.reseñaService.findOneById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReseñaDto: UpdateReseñaDto
  ) {
    return this.reseñaService.update(id, updateReseñaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) // O NO_CONTENT
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reseñaService.remove(id);
  }
}