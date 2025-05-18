import { Module } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { ActividadController } from './actividad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actividad } from './entities/actividad.entity';
import { Estudiante } from 'src/estudiante/entities/estudiante.entity'; // Necesario por ActividadService
import { Reseña } from 'src/reseña/entities/reseña.entity';         // Necesario por ActividadService

@Module({
  imports: [TypeOrmModule.forFeature([Actividad, Estudiante, Reseña])], // <--- AÑADIR ESTO
  controllers: [ActividadController],
  providers: [ActividadService],
})
export class ActividadModule {}