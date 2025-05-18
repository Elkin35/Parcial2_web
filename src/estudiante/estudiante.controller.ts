import { Controller, Get, Post, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
// import { UpdateEstudianteDto } from './dto/update-estudiante.dto'; // Si lo necesitas

@Controller('estudiantes') // Plural es una convención común para colecciones de recursos
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

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
  @HttpCode(HttpStatus.OK) // O CREATED si la inscripción crea un nuevo recurso de inscripción
  inscribirseActividad(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Param('actividadId', ParseIntPipe) actividadId: number,
  ) {
    return this.estudianteService.inscribirseActividad(estudianteId, actividadId);
  }

  // @Patch(':id')
  // update(@Param('id', ParseIntPipe) id: number, @Body() updateEstudianteDto: UpdateEstudianteDto) {
  //   return this.estudianteService.update(id, updateEstudianteDto);
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.estudianteService.remove(id);
  // }
}