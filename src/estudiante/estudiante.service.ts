import { Injectable } from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { Repository } from 'typeorm';
import { Reseña } from 'src/reseña/entities/reseña.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Actividad } from 'src/actividad/entities/actividad.entity';
import { Estudiante } from './entities/estudiante.entity';

@Injectable()
export class EstudianteService {

  constructor(
    @InjectRepository(Actividad)
    private actividadRepository: Repository<Actividad>,
    @InjectRepository(Reseña)
    private reseñaRepository: Repository<Reseña>,
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
  ) {}

  async crearEstudiante(createEstudianteDto: CreateEstudianteDto) {
    const estudiante = this.estudianteRepository.create(createEstudianteDto);
    return await this.estudianteRepository.save(estudiante);
  }

  async findEstudianteById(id: number) {
    const estudiante = await this.estudianteRepository.findOne({ 
      where: { id },
      relations: ['actividades', 'reseñas']
    });
    
    if (!estudiante) {
      throw new Error(`Estudiante con ID ${id} no encontrado`);
    }
    
    return estudiante;
  }

  async inscribirseActividad(estudianteId: number, actividadId: number) {

    const estudiante = await this.findEstudianteById(estudianteId);
    
    const actividad = await this.actividadRepository.findOne({
      where: { id: actividadId },
      relations: ['inscritos']
    });
    
    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }
    
    if (actividad.estado !== 0) {
      throw new Error('No se puede inscribir a una actividad que no está abierta');
    }
    
    if (actividad.inscritos && actividad.inscritos.length >= actividad.cupoMaximo) {
      throw new Error('La actividad no cuenta con cupo disponible');
    }
    
    const inscripcionExistente = actividad.inscritos?.some(e => e.id === estudianteId);
    if (inscripcionExistente) {
      throw new Error('El estudiante ya está inscrito en esta actividad');
    }
    
    if (!actividad.inscritos) {
      actividad.inscritos = [];
    }
    actividad.inscritos.push(estudiante);
    
    await this.actividadRepository.save(actividad);
    
    return { mensaje: 'Inscripción exitosa' };
  }

}
