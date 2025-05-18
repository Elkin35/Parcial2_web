import { Test, TestingModule } from '@nestjs/testing';
import { EstudianteService } from './estudiante.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Actividad } from '../actividad/entities/actividad.entity';
import { Repository } from 'typeorm';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

// Helper para crear un mock de repositorio genérico
const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  // Añade otros métodos que uses, como delete, etc.
});

describe('EstudianteService', () => {
  let service: EstudianteService;
  let estudianteRepository: ReturnType<typeof mockRepository>;
  let actividadRepository: ReturnType<typeof mockRepository>;

  const mockEstudiante: Estudiante = {
    id: 1,
    cedula: 12345,
    nombre: 'Juan Perez',
    correo: 'juan@test.com',
    programa: 'Sistemas',
    semestre: 5,
    actividades: [],
    reseñas: [],
  };

  const mockActividad: Actividad = {
    id: 1,
    titulo: 'Concierto de Rock',
    fecha: '2023-12-01',
    cupoMaximo: 100,
    estado: 0, // Abierta
    inscritos: [],
    reseñas: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudianteService,
        {
          provide: getRepositoryToken(Estudiante),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Actividad),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EstudianteService>(EstudianteService);
    estudianteRepository = module.get(getRepositoryToken(Estudiante));
    actividadRepository = module.get(getRepositoryToken(Actividad));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearEstudiante', () => {
    const createDto: CreateEstudianteDto = {
      cedula: 12345,
      nombre: 'Juan Perez',
      correo: 'juan@test.com',
      programa: 'Sistemas',
      semestre: 5,
    };

    it('debería crear y retornar un estudiante (caso positivo)', async () => {
      estudianteRepository.findOne.mockResolvedValue(null); // No existe por cédula ni correo
      estudianteRepository.create.mockReturnValue(mockEstudiante);
      estudianteRepository.save.mockResolvedValue(mockEstudiante);

      const result = await service.crearEstudiante(createDto);
      expect(result).toEqual(mockEstudiante);
      expect(estudianteRepository.create).toHaveBeenCalledWith(createDto);
      expect(estudianteRepository.save).toHaveBeenCalledWith(mockEstudiante);
    });

    it('debería lanzar ConflictException si la cédula ya existe (caso negativo)', async () => {
      estudianteRepository.findOne.mockImplementation(({ where: { cedula } }) => {
        if (cedula === createDto.cedula) return Promise.resolve(mockEstudiante);
        return Promise.resolve(null);
      });
      
      await expect(service.crearEstudiante(createDto)).rejects.toThrow(ConflictException);
    });

    it('debería lanzar ConflictException si el correo ya existe (caso negativo)', async () => {
      estudianteRepository.findOne.mockImplementation(({ where: { cedula, correo } }) => {
        if (cedula === createDto.cedula) return Promise.resolve(null); // Cédula no existe
        if (correo === createDto.correo) return Promise.resolve(mockEstudiante); // Correo sí existe
        return Promise.resolve(null);
      });

      await expect(service.crearEstudiante(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findEstudianteById', () => {
    it('debería retornar un estudiante si existe (caso positivo)', async () => {
      estudianteRepository.findOne.mockResolvedValue(mockEstudiante);
      const result = await service.findEstudianteById(1);
      expect(result).toEqual(mockEstudiante);
      expect(estudianteRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['actividades', 'reseñas'],
      });
    });

    it('debería lanzar NotFoundException si el estudiante no existe (caso negativo)', async () => {
      estudianteRepository.findOne.mockResolvedValue(null);
      await expect(service.findEstudianteById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('inscribirseActividad', () => {
    const estudianteId = 1;
    const actividadId = 1;

    it('debería inscribir al estudiante exitosamente (caso positivo)', async () => {
      const estudianteSinActividades = { ...mockEstudiante, actividades: [] };
      const actividadAbiertaConCupo = { ...mockActividad, estado: 0, inscritos: [] };

      estudianteRepository.findOne.mockResolvedValue(estudianteSinActividades); // findEstudianteById
      actividadRepository.findOne.mockResolvedValue(actividadAbiertaConCupo);
      estudianteRepository.save.mockResolvedValue(estudianteSinActividades); // Guardar estudiante actualizado

      const result = await service.inscribirseActividad(estudianteId, actividadId);
      expect(result).toEqual({ message: `Estudiante ${estudianteSinActividades.nombre} inscrito exitosamente en la actividad ${actividadAbiertaConCupo.titulo}.` });
      expect(estudianteRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si la actividad no está abierta (caso negativo)', async () => {
      const actividadCerrada = { ...mockActividad, estado: 1 }; // 1: Cerrada
      estudianteRepository.findOne.mockResolvedValue(mockEstudiante);
      actividadRepository.findOne.mockResolvedValue(actividadCerrada);

      await expect(service.inscribirseActividad(estudianteId, actividadId)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si la actividad no tiene cupo (caso negativo)', async () => {
        const actividadLlena = { ...mockActividad, estado: 0, inscritos: new Array(mockActividad.cupoMaximo), cupoMaximo: mockActividad.cupoMaximo };
        estudianteRepository.findOne.mockResolvedValue(mockEstudiante);
        actividadRepository.findOne.mockResolvedValue(actividadLlena);
  
        await expect(service.inscribirseActividad(estudianteId, actividadId)).rejects.toThrow(BadRequestException);
      });

    it('debería lanzar ConflictException si el estudiante ya está inscrito (caso negativo)', async () => {
      const estudianteYaInscrito = { ...mockEstudiante, actividades: [mockActividad] };
      const actividadAbierta = { ...mockActividad, estado: 0, inscritos: [mockEstudiante] }; 

      estudianteRepository.findOne.mockResolvedValue(estudianteYaInscrito);
      actividadRepository.findOne.mockResolvedValue(actividadAbierta);

      await expect(service.inscribirseActividad(estudianteId, actividadId)).rejects.toThrow(ConflictException);
    });
    
    it('debería lanzar NotFoundException si la actividad no existe (caso negativo)', async () => {
        estudianteRepository.findOne.mockResolvedValue(mockEstudiante);
        actividadRepository.findOne.mockResolvedValue(null); // Actividad no encontrada
  
        await expect(service.inscribirseActividad(estudianteId, 999)).rejects.toThrow(NotFoundException);
      });
  });
});