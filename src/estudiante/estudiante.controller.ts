import { Controller, Get, Post, Body, Param, ParseIntPipe, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';

@Controller('estudiantes') 
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  crearEstudiante(@Body() createEstudianteDto: CreateEstudianteDto) {
    return this.estudianteService.crearEstudiante(createEstudianteDto);
  }

  @Get()
  findAll() {
    return this.estudianteService.findAll();
  }

  @Get(':id')
  findEstudianteById(@Param('id', ParseIntPipe) id: number) {
    return this.estudianteService.findEstudianteById(id);
  }

  @Post(':estudianteId/inscribir/:actividadId')
  @HttpCode(HttpStatus.OK) 
  inscribirseActividad(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Param('actividadId', ParseIntPipe) actividadId: number,
  ) {
    return this.estudianteService.inscribirseActividad(estudianteId, actividadId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) 
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.estudianteService.remove(id);
  }

}