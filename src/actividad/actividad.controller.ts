import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

@Controller('actividades') // Plural
export class ActividadController {
  constructor(private readonly actividadService: ActividadService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  crearActividad(@Body() createActividadDto: CreateActividadDto) {
    return this.actividadService.crearActividad(createActividadDto);
  }

  @Get()
  findAll() {
    return this.actividadService.findAll();
  }

  @Get('por-fecha') 
  findAllActividadesByDate(@Query('fecha') fecha: string) {

    if (!fecha) {
        throw new BadRequestException('El parámetro "fecha" es requerido.');
    }
    return this.actividadService.findAllActividadesByDate(fecha);
  }

  @Get(':id')
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.actividadService.findOneById(id);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado', ParseIntPipe) nuevoEstado: number, 
  ) {
    
    return this.actividadService.cambiarEstado(id, nuevoEstado);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActividadDto: UpdateActividadDto
  ) {
    return this.actividadService.update(id, updateActividadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) 
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.actividadService.remove(id);
  }
}