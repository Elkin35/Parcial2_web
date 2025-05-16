import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReseñaService } from './reseña.service';
import { CreateReseñaDto } from './dto/create-reseña.dto';
import { UpdateReseñaDto } from './dto/update-reseña.dto';

@Controller('reseña')
export class ReseñaController {
  constructor(private readonly reseñaService: ReseñaService) {}

  @Post()
  create(@Body() createReseñaDto: CreateReseñaDto) {
    return this.reseñaService.create(createReseñaDto);
  }

  @Get()
  findAll() {
    return this.reseñaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reseñaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReseñaDto: UpdateReseñaDto) {
    return this.reseñaService.update(+id, updateReseñaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reseñaService.remove(+id);
  }
}
