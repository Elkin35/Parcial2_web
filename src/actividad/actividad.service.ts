import { Injectable } from '@nestjs/common';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { Estudiante } from 'src/estudiante/entities/estudiante.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reseña } from 'src/reseña/entities/reseña.entity';
import { Actividad } from './entities/actividad.entity';
import { CreateReseñaDto } from 'src/reseña/dto/create-reseña.dto';
import { CreateEstudianteDto } from 'src/estudiante/dto/create-estudiante.dto';

@Injectable()
export class ActividadService {
  
  constructor(
      @InjectRepository(Estudiante)
      private estudianteRepository: Repository<Estudiante>,
      @InjectRepository(Reseña)
      private reseñaRepository: Repository<Reseña>,
      @InjectRepository(Actividad)
      private actividadRepository: Repository<Actividad>,
    ) {}

    async crearActividad(createActividadDto: CreateActividadDto) {
      const actividad = this.actividadRepository.create({
        ...createActividadDto,
        inscritos: [],
        reseñas: []
      });
      return await this.actividadRepository.save(actividad);
    }

    async findOne(id: number) {
      return await this.actividadRepository.findOne({ 
        where: { id },
        relations: ['inscritos', 'reseñas']
      });
    }

    async findAllActividadesByDate(fecha: string) {
      return await this.actividadRepository.find({ 
        where: { fecha },
        relations: ['inscritos', 'reseñas']
      });
    }

    async cambiarEstado(actividadId: number, estado: number) {
      const actividad = await this.findOne(actividadId);
      
      if (!actividad) {
        throw new Error('Actividad no encontrada');
      }

      if (estado === 1) { // Cerrada
        const porcentajeOcupado = (actividad.inscritos.length / actividad.cupoMaximo) * 100;
        if (porcentajeOcupado < 80) {
          throw new Error('No se puede cerrar la actividad, el cupo no ha alcanzado el 80%');
        }
      } else if (estado === 2) { // Finalizada
        if (actividad.inscritos.length < actividad.cupoMaximo) {
          throw new Error('No se puede finalizar la actividad, aún hay cupos disponibles');
        }
      }

      actividad.estado = estado;
      return await this.actividadRepository.save(actividad);
    }

    async createEstudiante(createEstudianteDto: CreateEstudianteDto) {
      const estudiante = this.estudianteRepository.create({
        ...createEstudianteDto,
        actividades: [],
        reseñas: []
      });
      return await this.estudianteRepository.save(estudiante);
    }

    async findEstudianteById(id: number) {
      return await this.estudianteRepository.findOne({
        where: { id },
        relations: ['actividades', 'reseñas']
      });
    }

    async inscribirseActividad(estudianteId: number, actividadId: number) {
      const estudiante = await this.findEstudianteById(estudianteId);
      const actividad = await this.findOne(actividadId);

      if (!estudiante) {
        throw new Error('Estudiante no encontrado');
      }

      if (!actividad) {
        throw new Error('Actividad no encontrada');
      }

      if (actividad.estado !== 0) {
        throw new Error('La actividad no está abierta para inscripciones');
      }

      if (actividad.inscritos.length >= actividad.cupoMaximo) {
        throw new Error('No hay cupos disponibles en la actividad');
      }

      const yaInscrito = estudiante.actividades.some(act => act.id === actividadId);
      if (yaInscrito) {
        throw new Error('El estudiante ya está inscrito en esta actividad');
      }

      actividad.inscritos.push(estudiante);
      return await this.actividadRepository.save(actividad);
    }

    async agregarReseña(createReseñaDto: CreateReseñaDto) {
      const { estudianteId, actividadId, ...reseñaData } = createReseñaDto;
      
      const actividad = await this.findOne(actividadId);
      const estudiante = await this.findEstudianteById(estudianteId);
      
      if (!actividad) {
        throw new Error('Actividad no encontrada');
      }
      
      if (!estudiante) {
        throw new Error('Estudiante no encontrado');
      }
      
      if (actividad.estado !== 2) {
        throw new Error('Solo se pueden agregar reseñas a actividades finalizadas');
      }
      
      const inscrito = actividad.inscritos.some(est => est.id === estudianteId);
      if (!inscrito) {
        throw new Error('El estudiante no estaba inscrito en la actividad');
      }
      
      const reseña = this.reseñaRepository.create({
        ...reseñaData,
        estudiante,
        actividad
      });
      
      return await this.reseñaRepository.save(reseña);
    }

}
