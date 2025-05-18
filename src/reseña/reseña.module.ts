import { Module } from '@nestjs/common';
import { ReseñaService } from './reseña.service';
import { ReseñaController } from './reseña.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reseña } from './entities/reseña.entity';
import { Estudiante } from 'src/estudiante/entities/estudiante.entity'; // Necesario por ReseñaService
import { Actividad } from 'src/actividad/entities/actividad.entity';    // Necesario por ReseñaService

@Module({
  imports: [TypeOrmModule.forFeature([Reseña, Estudiante, Actividad])], // <--- AÑADIR ESTO
  controllers: [ReseñaController],
  providers: [ReseñaService],
})
export class ReseñaModule {}