import { Test, TestingModule } from '@nestjs/testing';
import { ReseñaController } from './reseña.controller';
import { ReseñaService } from './reseña.service';
import { CreateReseñaDto } from './dto/create-reseña.dto';
import { UpdateReseñaDto } from './dto/update-reseña.dto';
import { Reseña } from './entities/reseña.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity'; // Necesario para el tipo mock
import { Actividad } from '../actividad/entities/actividad.entity'; // Necesario para el tipo mock

const mockEstudianteGeneric: Partial<Estudiante> = { id: 1, nombre: 'Estudiante Test' };
const mockActividadGeneric: Partial<Actividad> = { id: 1, titulo: 'Actividad Test' };

const mockReseña: Reseña = {
  id: 1,
  comentario: 'Excelente reseña mock',
  calificacion: 5,
  fecha: '2024-01-01',
  estudiante: mockEstudianteGeneric as Estudiante,
  actividad: mockActividadGeneric as Actividad,
};

// Mock del servicio ReseñaService
const mockReseñaService = {
  agregarReseña: jest.fn().mockResolvedValue(mockReseña),
  findAll: jest.fn().mockResolvedValue([mockReseña]),
  findOneById: jest.fn().mockResolvedValue(mockReseña),
  update: jest.fn().mockResolvedValue(mockReseña),
  remove: jest.fn().mockResolvedValue({ message: 'Reseña eliminada Mock' }),
};

describe('ReseñaController', () => {
  let controller: ReseñaController;
  let service: typeof mockReseñaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReseñaController],
      providers: [
        {
          provide: ReseñaService,
          useValue: mockReseñaService,
        },
      ],
    }).compile();

    controller = module.get<ReseñaController>(ReseñaController);
    service = module.get(ReseñaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('agregarReseña', () => {
    it('debería llamar a service.agregarReseña y retornar la reseña creada', async () => {
      const dto: CreateReseñaDto = {
        estudianteId: 1,
        actividadId: 1,
        comentario: mockReseña.comentario,
        calificacion: mockReseña.calificacion,
        fecha: mockReseña.fecha,
      };
      const result = await controller.agregarReseña(dto);
      expect(result).toEqual(mockReseña);
      expect(service.agregarReseña).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('debería llamar a service.findAll y retornar un array de reseñas', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockReseña]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOneById', () => {
    it('debería llamar a service.findOneById y retornar una reseña', async () => {
      const id = 1;
      const result = await controller.findOneById(id);
      expect(result).toEqual(mockReseña);
      expect(service.findOneById).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('debería llamar a service.update y retornar la reseña actualizada', async () => {
      const id = 1;
      const dto: UpdateReseñaDto = { comentario: 'Comentario Actualizado' };
      const updatedReseña = { ...mockReseña, ...dto };
      service.update.mockResolvedValue(updatedReseña);

      const result = await controller.update(id, dto);
      expect(result).toEqual(updatedReseña);
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('debería llamar a service.remove y retornar el mensaje de éxito', async () => {
      const id = 1;
      const result = await controller.remove(id);
      expect(result).toEqual({ message: 'Reseña eliminada Mock' });
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});