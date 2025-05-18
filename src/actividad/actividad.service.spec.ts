import { Test, TestingModule } from '@nestjs/testing';
import { ActividadService } from './actividad.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Actividad } from './entities/actividad.entity';
import { Repository } from 'typeorm';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

describe('ActividadService', () => {
  let service: ActividadService;
  let actividadRepository: ReturnType<typeof mockRepository>;

  const mockActividad: Actividad = {
    id: 1,
    titulo: 'Exposición de Arte Moderno',
    fecha: '2024-01-15',
    cupoMaximo: 50,
    estado: 0, // Abierta
    inscritos: [],
    reseñas: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActividadService,
        {
          provide: getRepositoryToken(Actividad),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ActividadService>(ActividadService);
    actividadRepository = module.get(getRepositoryToken(Actividad));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearActividad', () => {
    const createDto: CreateActividadDto = {
      titulo: 'Taller de Escritura Creativa Avanzado',
      fecha: '2024-02-10',
      cupoMaximo: 20,
      estado: 0, // El DTO lo pone por defecto, pero lo incluimos para claridad
    };
    const expectedActividad = { ...mockActividad, ...createDto, id: 2, inscritos:[], reseñas:[] };


    it('debería crear y retornar una actividad (caso positivo)', async () => {
      actividadRepository.create.mockReturnValue(expectedActividad);
      actividadRepository.save.mockResolvedValue(expectedActividad);

      const result = await service.crearActividad(createDto);
      expect(result).toEqual(expectedActividad);
      expect(actividadRepository.create).toHaveBeenCalledWith({
        ...createDto,
        inscritos: [],
        reseñas: [],
      });
      expect(actividadRepository.save).toHaveBeenCalledWith(expectedActividad);
    });
  });

  describe('findOneById', () => {
    it('debería retornar una actividad si existe (caso positivo)', async () => {
      actividadRepository.findOne.mockResolvedValue(mockActividad);
      const result = await service.findOneById(1);
      expect(result).toEqual(mockActividad);
      expect(actividadRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['inscritos', 'reseñas'],
      });
    });

    it('debería lanzar NotFoundException si la actividad no existe (caso negativo)', async () => {
      actividadRepository.findOne.mockResolvedValue(null);
      await expect(service.findOneById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllActividadesByDate', () => {
    const testFecha = '2024-01-15';
    it('debería retornar un array de actividades para una fecha dada (caso positivo)', async () => {
      const actividadesEnFecha = [mockActividad, { ...mockActividad, id: 2, titulo: 'Otra Actividad Mismo Día' }];
      actividadRepository.find.mockResolvedValue(actividadesEnFecha);

      const result = await service.findAllActividadesByDate(testFecha);
      expect(result).toEqual(actividadesEnFecha);
      expect(actividadRepository.find).toHaveBeenCalledWith({
        where: { fecha: testFecha },
        relations: ['inscritos', 'reseñas'],
      });
    });

    it('debería retornar un array vacío si no hay actividades para esa fecha (caso positivo)', async () => {
      actividadRepository.find.mockResolvedValue([]);
      const result = await service.findAllActividadesByDate('2000-01-01');
      expect(result).toEqual([]);
    });
  });

  describe('cambiarEstado', () => {
    const actividadId = 1;

    it('debería cambiar estado a CERRADA (1) si el cupo >= 80% (caso positivo)', async () => {
      const actividadConCupoSuficiente = {
        ...mockActividad,
        cupoMaximo: 10,
        // inscritos: new Array(8), // Array de 8 elementos (mock de Estudiante si es necesario)
        inscritos: Array(8).fill(null).map((_, i) => ({ id: i + 100 }) as any), // Mock simplificado
      };
      actividadRepository.findOne.mockResolvedValue(actividadConCupoSuficiente);
      actividadRepository.save.mockImplementation(act => Promise.resolve(act)); // Devuelve la actividad modificada

      const result = await service.cambiarEstado(actividadId, 1);
      expect(result.estado).toBe(1);
      expect(actividadRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: actividadId, estado: 1 }));
    });

    it('debería lanzar BadRequestException al intentar cambiar a CERRADA (1) si cupo < 80% (caso negativo)', async () => {
      const actividadConCupoInsuficiente = {
        ...mockActividad,
        cupoMaximo: 10,
        inscritos: new Array(7) as any, // 70%
      };
      actividadRepository.findOne.mockResolvedValue(actividadConCupoInsuficiente);
      await expect(service.cambiarEstado(actividadId, 1)).rejects.toThrow(BadRequestException);
    });

    it('debería cambiar estado a FINALIZADA (2) si el cupo está lleno (caso positivo)', async () => {
      const actividadConCupoLleno = {
        ...mockActividad,
        cupoMaximo: 5,
        inscritos: new Array(5) as any,
      };
      actividadRepository.findOne.mockResolvedValue(actividadConCupoLleno);
      actividadRepository.save.mockImplementation(act => Promise.resolve(act));

      const result = await service.cambiarEstado(actividadId, 2);
      expect(result.estado).toBe(2);
    });

    it('debería lanzar BadRequestException al intentar cambiar a FINALIZADA (2) si aún hay cupos (caso negativo)', async () => {
      const actividadConCupos = {
        ...mockActividad,
        cupoMaximo: 5,
        inscritos: new Array(4) as any,
      };
      actividadRepository.findOne.mockResolvedValue(actividadConCupos);
      await expect(service.cambiarEstado(actividadId, 2)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si se intenta un estado inválido (caso negativo)', async () => {
      actividadRepository.findOne.mockResolvedValue(mockActividad);
      await expect(service.cambiarEstado(actividadId, 3)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si la actividad no existe (caso negativo)', async () => {
      actividadRepository.findOne.mockResolvedValue(null);
      await expect(service.cambiarEstado(99, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateActividadDto = { titulo: 'Título Actualizado de la Actividad' };
    it('debería actualizar y retornar la actividad (caso positivo)', async () => {
      const actividadActualizada = { ...mockActividad, ...updateDto };
      actividadRepository.preload.mockResolvedValue(actividadActualizada); // Simula que la entidad existe y se fusiona
      actividadRepository.save.mockResolvedValue(actividadActualizada);

      const result = await service.update(mockActividad.id, updateDto);
      expect(result).toEqual(actividadActualizada);
      expect(actividadRepository.preload).toHaveBeenCalledWith({ id: mockActividad.id, ...updateDto });
      expect(actividadRepository.save).toHaveBeenCalledWith(actividadActualizada);
    });

    it('debería lanzar NotFoundException si la actividad a actualizar no existe (caso negativo)', async () => {
      actividadRepository.preload.mockResolvedValue(null); // Simula que la entidad no existe
      await expect(service.update(99, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería eliminar la actividad (caso positivo)', async () => {
      actividadRepository.delete.mockResolvedValue({ affected: 1, raw: [] });
      const result = await service.remove(mockActividad.id);
      expect(result).toEqual({ message: `Actividad con ID ${mockActividad.id} eliminada correctamente.` });
      expect(actividadRepository.delete).toHaveBeenCalledWith(mockActividad.id);
    });

    it('debería lanzar NotFoundException si la actividad a eliminar no existe (caso negativo)', async () => {
      actividadRepository.delete.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});