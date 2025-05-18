import { Module } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Actividad } from 'src/actividad/entities/actividad.entity'; // Necesario por EstudianteService
import { Reseña } from 'src/reseña/entities/reseña.entity';       // Necesario por EstudianteService

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante, Actividad, Reseña])], // <--- AÑADIR ESTO
  controllers: [EstudianteController],
  providers: [EstudianteService],
})
export class EstudianteModule {}