import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

@Controller('actividad')
export class ActividadController {
  constructor(private readonly actividadService: ActividadService) {}

  @Post(':actividadId/inscripcion/:usuarioId')
  inscribirseActividad(
    @Param('actividadId') actividadId: number,
    @Param('usuarioId') usuarioId: number
  ) {
    return this.actividadService.inscribirseActividad(actividadId, usuarioId);
  }
  
}
