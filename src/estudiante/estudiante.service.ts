import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { Actividad } from '../actividad/entities/actividad.entity';
// No necesitas ReseñaRepository aquí directamente si solo manejas inscripciones.

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  async crearEstudiante(createEstudianteDto: CreateEstudianteDto): Promise<Estudiante> {
    // Las validaciones de formato (email, semestre) las maneja el ValidationPipe global gracias a los DTOs.
    // Puedes agregar validaciones de negocio aquí si es necesario (e.g., cédula única)
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

    // Verificar si el estudiante ya está inscrito
    // Cargar la relación 'actividades' del estudiante si no se cargó en findEstudianteById
    // O hacer una consulta más específica si es necesario para optimizar.
    // En este caso, findEstudianteById ya carga 'actividades'.
    const yaInscritoEnEstaActividad = estudiante.actividades?.some(act => act.id === actividadId);
    if (yaInscritoEnEstaActividad) {
      throw new ConflictException('El estudiante ya está inscrito en esta actividad.');
    }
    
    // Si la relación 'actividades' en estudiante no estaba inicializada
    if (!estudiante.actividades) {
        estudiante.actividades = [];
    }
    estudiante.actividades.push(actividad);
    await this.estudianteRepository.save(estudiante); // Guardar el estudiante actualiza la tabla intermedia

    // También es buena práctica actualizar el lado de actividad si es necesario, aunque TypeORM
    // con @ManyToMany y cascade puede manejarlo. Aquí actualizaremos explícitamente por claridad.
    // if (!actividad.inscritos) {
    //   actividad.inscritos = [];
    // }
    // actividad.inscritos.push(estudiante); // Esto se actualiza por la relación
    // await this.actividadRepository.save(actividad);

    return { message: `Estudiante ${estudiante.nombre} inscrito exitosamente en la actividad ${actividad.titulo}.` };
  }

  // Otros métodos que podrías necesitar (findAll, update, remove)
  async findAll(): Promise<Estudiante[]> {
    return this.estudianteRepository.find({ relations: ['actividades', 'reseñas'] });
  }
}