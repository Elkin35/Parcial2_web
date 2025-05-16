import { Injectable } from '@nestjs/common';
import { CreateReseñaDto } from './dto/create-reseña.dto';
import { UpdateReseñaDto } from './dto/update-reseña.dto';
import { Actividad } from 'src/actividad/entities/actividad.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from 'src/estudiante/entities/estudiante.entity';
import { Reseña } from './entities/reseña.entity';

@Injectable()
export class ReseñaService {

  constructor(
        @InjectRepository(Estudiante)
        private estudianteRepository: Repository<Estudiante>,
        @InjectRepository(Actividad)
        private actividadRepository: Repository<Actividad>,
        @InjectRepository(Reseña)
        private ReseñaRepository: Repository<Reseña>,
      ) {}

      async create(createReseñaDto: CreateReseñaDto): Promise<Reseña> {
        const { estudianteId, actividadId, comentario, calificacion, fecha } = createReseñaDto;
        
        const estudiante = await this.estudianteRepository.findOne({
          where: { id: estudianteId },
          relations: ['actividades']
        });
        
        const actividad = await this.actividadRepository.findOne({
          where: { id: actividadId }
        });
        
        if (!estudiante) {
          throw new Error('Estudiante no encontrado');
        }
        
        if (!actividad) {
          throw new Error('Actividad no encontrada');
        }
        
        if (actividad.estado !== 2) {
          throw new Error('La actividad debe estar finalizada para agregar una reseña');
        }
        
        const estuvoInscrito = estudiante.actividades.some(act => act.id === actividad.id);
        if (!estuvoInscrito) {
          throw new Error('El estudiante no estuvo inscrito en esta actividad');
        }
        
        const reseña = new Reseña();
        reseña.comentario = comentario;
        reseña.calificacion = calificacion;
        reseña.fecha = fecha;
        reseña.estudiante = estudiante;
        reseña.actividad = actividad;
        
        return this.ReseñaRepository.save(reseña);
      }

      async findAll(): Promise<Reseña[]> {
        return this.ReseñaRepository.find({
          relations: ['estudiante', 'actividad']
        });
      }

      async findOne(id: number): Promise<Reseña> {
        const reseña = await this.ReseñaRepository.findOne({
          where: { id },
          relations: ['estudiante', 'actividad']
        });
        
        if (!reseña) {
          throw new Error('Reseña no encontrada');
        }
        
        return reseña;
      }

      async agregarReseña(createReseñaDto: CreateReseñaDto): Promise<Reseña> {
        return this.create(createReseñaDto);
      }

      async update(id: number, updateReseñaDto: UpdateReseñaDto): Promise<Reseña> {
        const reseña = await this.findOne(id);
        
        // Actualizar los campos
        Object.assign(reseña, updateReseñaDto);
        
        return this.ReseñaRepository.save(reseña);
      }

      async remove(id: number): Promise<void> {
        const result = await this.ReseñaRepository.delete(id);
        
        if (result.affected === 0) {
          throw new Error('Reseña no encontrada');
        }
      }

}
