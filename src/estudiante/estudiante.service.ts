import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { Actividad } from '../actividad/entities/actividad.entity';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  async crearEstudiante(createEstudianteDto: CreateEstudianteDto): Promise<Estudiante> {

    const existingEstudianteByCedula = await this.estudianteRepository.findOne({ where: { cedula: createEstudianteDto.cedula } });
    if (existingEstudianteByCedula) {
      throw new ConflictException(`Ya existe un estudiante con la cédula ${createEstudianteDto.cedula}`);
    }
    const existingEstudianteByCorreo = await this.estudianteRepository.findOne({ where: { correo: createEstudianteDto.correo } });
    if (existingEstudianteByCorreo) {
      throw new ConflictException(`Ya existe un estudiante con el correo ${createEstudianteDto.correo}`);
    }

    const estudiante = this.estudianteRepository.create(createEstudianteDto);
    return this.estudianteRepository.save(estudiante);
  }

  async findEstudianteById(id: number): Promise<Estudiante> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['actividades', 'reseñas'], // Cargar relaciones según necesidad
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }
    return estudiante;
  }

  async inscribirseActividad(estudianteId: number, actividadId: number): Promise<{ message: string }> {
    const estudiante = await this.findEstudianteById(estudianteId); // Ya maneja NotFoundException

    const actividad = await this.actividadRepository.findOne({
      where: { id: actividadId },
      relations: ['inscritos'], // Necesitamos 'inscritos' para verificar cupo e inscripciones previas
    });

    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${actividadId} no encontrada`);
    }

    if (actividad.estado !== 0) { // 0: Abierta
      throw new BadRequestException('No se puede inscribir a una actividad que no está abierta.');
    }

    if (actividad.inscritos && actividad.inscritos.length >= actividad.cupoMaximo) {
      throw new BadRequestException('La actividad no cuenta con cupo disponible.');
    }

    const yaInscritoEnEstaActividad = estudiante.actividades?.some(act => act.id === actividadId);
    if (yaInscritoEnEstaActividad) {
      throw new ConflictException('El estudiante ya está inscrito en esta actividad.');
    }
    
    // Si la relación 'actividades' en estudiante no estaba inicializada
    if (!estudiante.actividades) {
        estudiante.actividades = [];
    }
    estudiante.actividades.push(actividad);
    await this.estudianteRepository.save(estudiante);

    return { message: `Estudiante ${estudiante.nombre} inscrito exitosamente en la actividad ${actividad.titulo}.` };
  }

  async findAll(): Promise<Estudiante[]> {
    return this.estudianteRepository.find({ relations: ['actividades', 'reseñas'] });
  }

  async remove(id: number): Promise<{ message: string }> {

    const estudiante = await this.estudianteRepository.findOne({
        where: { id },
        relations: ['reseñas', 'actividades'], // Cargar para ver si hay dependencias
    });

    if (!estudiante) {
        throw new NotFoundException(`Estudiante con ID ${id} no encontrado.`);
    }

    const result = await this.estudianteRepository.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException(`Estudiante con ID ${id} no encontrado para eliminar.`);
    }
    return { message: `Estudiante con ID ${id} eliminado correctamente.` };
}

}