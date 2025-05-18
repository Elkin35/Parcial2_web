import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

// DTO para el body de cambiarEstado si prefieres DTOs para todo
// export class CambiarEstadoActividadDto {
//   @IsNumber()
//   @IsIn([0, 1, 2])
//   estado: number;
// }

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

  @Get('por-fecha') // Ruta más descriptiva
  findAllActividadesByDate(@Query('fecha') fecha: string) {
    // Aquí podrías añadir un DTO para el QueryParam si necesitas validaciones más complejas para la fecha.
    // O un ValidationPipe custom.
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
    @Body('estado', ParseIntPipe) nuevoEstado: number, // Asumiendo que 'estado' viene en el body
    // O usando un DTO: @Body() cambiarEstadoDto: CambiarEstadoActividadDto
  ) {
    // if (cambiarEstadoDto) return this.actividadService.cambiarEstado(id, cambiarEstadoDto.estado);
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
  @HttpCode(HttpStatus.OK) // O NO_CONTENT si no devuelves mensaje
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.actividadService.remove(id);
  }
}