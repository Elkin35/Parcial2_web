import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from './entities/actividad.entity';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

@Injectable()
export class ActividadService {
  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  async crearActividad(createActividadDto: CreateActividadDto): Promise<Actividad> {

    const actividad = this.actividadRepository.create({
      ...createActividadDto,
      inscritos: [],
      reseñas: [],  
    });
    return this.actividadRepository.save(actividad);
  }

  async findAll(): Promise<Actividad[]> {
    return this.actividadRepository.find({ relations: ['inscritos', 'reseñas'] });
  }

  async findOneById(id: number): Promise<Actividad> {
    const actividad = await this.actividadRepository.findOne({
      where: { id },
      relations: ['inscritos', 'reseñas'],
    });
    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada.`);
    }
    return actividad;
  }

  async findAllActividadesByDate(fecha: string): Promise<Actividad[]> {
    const actividades = await this.actividadRepository.find({
      where: { fecha },
      relations: ['inscritos', 'reseñas'],
    });

    return actividades;
  }

  async cambiarEstado(actividadId: number, nuevoEstado: number): Promise<Actividad> {
    const actividad = await this.findOneById(actividadId);

    // Validar que nuevoEstado sea 0, 1 o 2
    if (![0, 1, 2].includes(nuevoEstado)) {
        throw new BadRequestException('El estado debe ser 0 (Abierta), 1 (Cerrada) o 2 (Finalizada).');
    }

    if (nuevoEstado === 1) { // Cerrada
      const porcentajeOcupado = (actividad.inscritos.length / actividad.cupoMaximo) * 100;
      if (porcentajeOcupado < 80) {
        throw new BadRequestException(
          `No se puede cerrar la actividad. El cupo (${porcentajeOcupado.toFixed(2)}%) no ha alcanzado el 80%. Se requieren ${Math.ceil(actividad.cupoMaximo * 0.8)} inscritos. Actualmente hay ${actividad.inscritos.length}.`,
        );
      }
    } else if (nuevoEstado === 2) { // Finalizada
      if (actividad.inscritos.length < actividad.cupoMaximo) {
        throw new BadRequestException(
          `No se puede finalizar la actividad. Aún hay cupos disponibles (${actividad.inscritos.length}/${actividad.cupoMaximo}). Se requiere cupo lleno.`,
        );
      }
    }

    actividad.estado = nuevoEstado;
    return this.actividadRepository.save(actividad);
  }

  async update(id: number, updateActividadDto: UpdateActividadDto): Promise<Actividad> {

    const actividad = await this.actividadRepository.preload({
        id: id,
        ...updateActividadDto,
    });
    if (!actividad) {
        throw new NotFoundException(`Actividad con ID ${id} no encontrada para actualizar.`);
    }
    return this.actividadRepository.save(actividad);
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.actividadRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada para eliminar.`);
    }
    return { message: `Actividad con ID ${id} eliminada correctamente.` };
  }
}