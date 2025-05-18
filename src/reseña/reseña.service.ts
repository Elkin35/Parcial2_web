import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reseña } from './entities/reseña.entity';
import { CreateReseñaDto } from './dto/create-reseña.dto';
import { UpdateReseñaDto } from './dto/update-reseña.dto';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { Actividad } from '../actividad/entities/actividad.entity';

@Injectable()
export class ReseñaService {
  constructor(
    @InjectRepository(Reseña)
    private readonly reseñaRepository: Repository<Reseña>,
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  async agregarReseña(createReseñaDto: CreateReseñaDto): Promise<Reseña> {
    const { estudianteId, actividadId, comentario, calificacion, fecha } = createReseñaDto;

    const estudiante = await this.estudianteRepository.findOne({
        where: { id: estudianteId },
        relations: ['actividades'] // Necesario para verificar inscripción
    });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${estudianteId} no encontrado.`);
    }

    const actividad = await this.actividadRepository.findOne({
        where: { id: actividadId },
        // No es estrictamente necesario cargar 'inscritos' aquí si solo verificamos
        // a través de estudiante.actividades, pero podría ser útil para otras validaciones.
        // relations: ['inscritos']
    });
    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${actividadId} no encontrada.`);
    }

    if (actividad.estado !== 2) { // 2: Finalizada
      throw new BadRequestException('Solo se pueden agregar reseñas a actividades finalizadas.');
    }

    const estuvoInscrito = estudiante.actividades?.some(act => act.id === actividad.id);
    if (!estuvoInscrito) {
      throw new BadRequestException('El estudiante no estuvo inscrito en esta actividad y no puede agregar una reseña.');
    }
    
    // Opcional: Verificar si ya existe una reseña de este estudiante para esta actividad
    const existingResena = await this.reseñaRepository.findOne({
        where: {
            estudiante: { id: estudianteId },
            actividad: { id: actividadId }
        }
    });
    if (existingResena) {
        throw new ConflictException('El estudiante ya ha agregado una reseña para esta actividad.');
    }


    const nuevaReseña = this.reseñaRepository.create({
      comentario,
      calificacion,
      fecha, // Asegúrate que el formato de fecha sea consistente o usa Date
      estudiante, // Asignar la entidad completa
      actividad,  // Asignar la entidad completa
    });

    return this.reseñaRepository.save(nuevaReseña);
  }

  async findAll(): Promise<Reseña[]> {
    return this.reseñaRepository.find({
      relations: ['estudiante', 'actividad'], // Cargar para mostrar información relacionada
    });
  }

  async findOneById(id: number): Promise<Reseña> {
    const reseña = await this.reseñaRepository.findOne({
      where: { id },
      relations: ['estudiante', 'actividad'],
    });
    if (!reseña) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada.`);
    }
    return reseña;
  }

  async update(id: number, updateReseñaDto: UpdateReseñaDto): Promise<Reseña> {
    // `preload` es bueno aquí. No necesitamos re-validar estudianteId y actividadId si no cambian.
    // Si pudieran cambiar, la lógica sería más compleja para revalidar la inscripción y estado.
    // Por ahora, asumimos que solo se actualizan comentario, calificación, fecha.
    const reseña = await this.reseñaRepository.preload({
        id: id,
        ...updateReseñaDto,
    });

    if (!reseña) {
        throw new NotFoundException(`Reseña con ID ${id} no encontrada para actualizar.`);
    }

    // Si estudianteId o actividadId están en UpdateReseñaDto y pueden cambiar,
    // necesitarías volver a cargar las entidades Estudiante y Actividad y revalidar
    // las condiciones de 'agregarReseña'. Por simplicidad, asumimos que no cambian
    // o que el DTO solo permite actualizar campos simples.
    // Si permites cambiar estudianteId/actividadId, la lógica se complica:
    // if (updateReseñaDto.estudianteId && reseña.estudiante.id !== updateReseñaDto.estudianteId) { /* revalidar */ }
    // if (updateReseñaDto.actividadId && reseña.actividad.id !== updateReseñaDto.actividadId) { /* revalidar */ }

    return this.reseñaRepository.save(reseña);
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.reseñaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada para eliminar.`);
    }
    return { message: `Reseña con ID ${id} eliminada correctamente.` };
  }
}