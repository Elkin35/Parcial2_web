import { Test, TestingModule } from '@nestjs/testing';
import { ReseñaService } from './reseña.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reseña } from './entities/reseña.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { Actividad } from '../actividad/entities/actividad.entity';
import { Repository } from 'typeorm';
import { CreateReseñaDto } from './dto/create-reseña.dto';
import { UpdateReseñaDto } from './dto/update-reseña.dto';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

describe('ReseñaService', () => {
  let service: ReseñaService;
  let reseñaRepository: ReturnType<typeof mockRepository>;
  let estudianteRepository: ReturnType<typeof mockRepository>;
  let actividadRepository: ReturnType<typeof mockRepository>;

  const mockActividadFinalizada: Actividad = {
    id: 1,
    titulo: 'Obra de Teatro Clásico',
    fecha: '2023-11-20',
    cupoMaximo: 30,
    estado: 2, // Finalizada
    inscritos: [],
    reseñas: [],
  };

  const mockEstudianteInscrito: Estudiante = {
    id: 1,
    cedula: 123,
    nombre: 'Carlos Prueba',
    correo: 'carlos@test.com',
    programa: 'Artes',
    semestre: 3,
    actividades: [mockActividadFinalizada], // Inscrito en la actividad finalizada
    reseñas: [],
  };
  
  const mockReseña: Reseña = {
    id: 1,
    comentario: 'Excelente obra, muy recomendada.',
    calificacion: 5,
    fecha: '2023-11-21',
    estudiante: mockEstudianteInscrito,
    actividad: mockActividadFinalizada,
  };

  const createDto: CreateReseñaDto = {
    estudianteId: mockEstudianteInscrito.id,
    actividadId: mockActividadFinalizada.id,
    comentario: 'Muy buena experiencia',
    calificacion: 4,
    fecha: '2023-11-22',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReseñaService,
        { provide: getRepositoryToken(Reseña), useFactory: mockRepository },
        { provide: getRepositoryToken(Estudiante), useFactory: mockRepository },
        { provide: getRepositoryToken(Actividad), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<ReseñaService>(ReseñaService);
    reseñaRepository = module.get(getRepositoryToken(Reseña));
    estudianteRepository = module.get(getRepositoryToken(Estudiante));
    actividadRepository = module.get(getRepositoryToken(Actividad));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('agregarReseña', () => {
    it('debería agregar una reseña exitosamente (caso positivo)', async () => {
      estudianteRepository.findOne.mockResolvedValue(mockEstudianteInscrito);
      actividadRepository.findOne.mockResolvedValue(mockActividadFinalizada);
      reseñaRepository.findOne.mockResolvedValue(null); // No existe reseña previa
      reseñaRepository.create.mockImplementation(dto => ({ ...dto, id: 2 } as any)); // Simula creación
      reseñaRepository.save.mockImplementation(reseña => Promise.resolve(reseña as Reseña));

      const result = await service.agregarReseña(createDto);
      
      expect(result).toBeDefined();
      expect(result.comentario).toEqual(createDto.comentario);
      expect(reseñaRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        comentario: createDto.comentario,
        calificacion: createDto.calificacion,
        estudiante: mockEstudianteInscrito, // Debe ser la entidad completa
        actividad: mockActividadFinalizada // Debe ser la entidad completa
      }));
      expect(reseñaRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el estudiante no existe (caso negativo)', async () => {
      estudianteRepository.findOne.mockResolvedValue(null);
      actividadRepository.findOne.mockResolvedValue(mockActividadFinalizada);
      await expect(service.agregarReseña(createDto)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar NotFoundException si la actividad no existe (caso negativo)', async () => {
      estudianteRepository.findOne.mockResolvedValue(mockEstudianteInscrito);
      actividadRepository.findOne.mockResolvedValue(null);
      await expect(service.agregarReseña(createDto)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException si la actividad no está finalizada (caso negativo)', async () => {
      const actividadAbierta = { ...mockActividadFinalizada, estado: 0 };
      estudianteRepository.findOne.mockResolvedValue(mockEstudianteInscrito);
      actividadRepository.findOne.mockResolvedValue(actividadAbierta);
      await expect(service.agregarReseña(createDto)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si el estudiante no estuvo inscrito (caso negativo)', async () => {
      const estudianteNoInscrito = { ...mockEstudianteInscrito, actividades: [] };
      estudianteRepository.findOne.mockResolvedValue(estudianteNoInscrito);
      actividadRepository.findOne.mockResolvedValue(mockActividadFinalizada);
      await expect(service.agregarReseña(createDto)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar ConflictException si el estudiante ya agregó una reseña para esa actividad (caso negativo)', async () => {
        estudianteRepository.findOne.mockResolvedValue(mockEstudianteInscrito);
        actividadRepository.findOne.mockResolvedValue(mockActividadFinalizada);
        reseñaRepository.findOne.mockResolvedValue(mockReseña); // Simula que ya existe una reseña
  
        await expect(service.agregarReseña(createDto)).rejects.toThrow(ConflictException);
      });
  });

  describe('findOneById', () => {
    it('debería retornar una reseña si existe (caso positivo)', async () => {
      reseñaRepository.findOne.mockResolvedValue(mockReseña);
      const result = await service.findOneById(mockReseña.id);
      expect(result).toEqual(mockReseña);
      expect(reseñaRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockReseña.id },
        relations: ['estudiante', 'actividad'],
      });
    });

    it('debería lanzar NotFoundException si la reseña no existe (caso negativo)', async () => {
      reseñaRepository.findOne.mockResolvedValue(null);
      await expect(service.findOneById(99)).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('findAll', () => {
    it('debería retornar un array de reseñas (caso positivo)', async () => {
      const reseñasArray = [mockReseña, { ...mockReseña, id: 2, comentario: "Otra reseña" }];
      reseñaRepository.find.mockResolvedValue(reseñasArray);
      const result = await service.findAll();
      expect(result).toEqual(reseñasArray);
      expect(reseñaRepository.find).toHaveBeenCalledWith({ relations: ['estudiante', 'actividad'] });
    });
  });

  describe('update', () => {
    const updateDto: UpdateReseñaDto = { comentario: 'Comentario actualizado.' };
    it('debería actualizar y retornar la reseña (caso positivo)', async () => {
      const reseñaPreload = { ...mockReseña, ...updateDto }; // Simula el resultado de preload
      reseñaRepository.preload.mockResolvedValue(reseñaPreload);
      reseñaRepository.save.mockResolvedValue(reseñaPreload);

      const result = await service.update(mockReseña.id, updateDto);
      expect(result).toEqual(reseñaPreload);
      expect(reseñaRepository.preload).toHaveBeenCalledWith({ id: mockReseña.id, ...updateDto });
      expect(reseñaRepository.save).toHaveBeenCalledWith(reseñaPreload);
    });

    it('debería lanzar NotFoundException si la reseña a actualizar no existe (caso negativo)', async () => {
      reseñaRepository.preload.mockResolvedValue(null);
      await expect(service.update(99, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería eliminar la reseña (caso positivo)', async () => {
      reseñaRepository.delete.mockResolvedValue({ affected: 1, raw: [] });
      const result = await service.remove(mockReseña.id);
      expect(result).toEqual({ message: `Reseña con ID ${mockReseña.id} eliminada correctamente.` });
      expect(reseñaRepository.delete).toHaveBeenCalledWith(mockReseña.id);
    });

    it('debería lanzar NotFoundException si la reseña a eliminar no existe (caso negativo)', async () => {
      reseñaRepository.delete.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});