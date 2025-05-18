import { Module } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Actividad } from 'src/actividad/entities/actividad.entity';
import { Reseña } from 'src/reseña/entities/reseña.entity';       

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante, Actividad, Reseña])],
  controllers: [EstudianteController],
  providers: [EstudianteService],
})
export class EstudianteModule {}