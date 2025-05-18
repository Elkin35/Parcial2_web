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
        relations: ['actividades']
    });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${estudianteId} no encontrado.`);
    }

    const actividad = await this.actividadRepository.findOne({
        where: { id: actividadId },

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
      fecha, 
      estudiante, 
      actividad,  
    });

    return this.reseñaRepository.save(nuevaReseña);
  }

  async findAll(): Promise<Reseña[]> {
    return this.reseñaRepository.find({
      relations: ['estudiante', 'actividad'],
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

    const reseña = await this.reseñaRepository.preload({
        id: id,
        ...updateReseñaDto,
    });

    if (!reseña) {
        throw new NotFoundException(`Reseña con ID ${id} no encontrada para actualizar.`);
    }

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