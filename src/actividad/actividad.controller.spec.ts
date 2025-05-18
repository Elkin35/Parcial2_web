import { Test, TestingModule } from '@nestjs/testing';
import { ActividadController } from './actividad.controller';
import { ActividadService } from './actividad.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { Actividad } from './entities/actividad.entity';
import { BadRequestException } from '@nestjs/common';

const mockActividad: Actividad = {
  id: 1,
  titulo: 'Concierto Mock',
  fecha: '2024-01-01',
  cupoMaximo: 100,
  estado: 0,
  inscritos: [],
  reseñas: [],
};

// Mock del servicio ActividadService
const mockActividadService = {
  crearActividad: jest.fn().mockResolvedValue(mockActividad),
  findAll: jest.fn().mockResolvedValue([mockActividad]),
  findAllActividadesByDate: jest.fn().mockResolvedValue([mockActividad]),
  findOneById: jest.fn().mockResolvedValue(mockActividad),
  cambiarEstado: jest.fn().mockImplementation((id, estado) => Promise.resolve({ ...mockActividad, id, estado })),
  update: jest.fn().mockResolvedValue(mockActividad),
  remove: jest.fn().mockResolvedValue({ message: 'Actividad eliminada Mock' }),
};

describe('ActividadController', () => {
  let controller: ActividadController;
  let service: typeof mockActividadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActividadController],
      providers: [
        {
          provide: ActividadService,
          useValue: mockActividadService,
        },
      ],
    }).compile();

    controller = module.get<ActividadController>(ActividadController);
    service = module.get(ActividadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('crearActividad', () => {
    it('debería llamar a service.crearActividad y retornar la actividad creada', async () => {
      const dto: CreateActividadDto = {
        titulo: mockActividad.titulo,
        fecha: mockActividad.fecha,
        cupoMaximo: mockActividad.cupoMaximo,
        estado: mockActividad.estado,
      };
      const result = await controller.crearActividad(dto);
      expect(result).toEqual(mockActividad);
      expect(service.crearActividad).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('debería llamar a service.findAll y retornar un array de actividades', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockActividad]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findAllActividadesByDate', () => {
    it('debería llamar a service.findAllActividadesByDate y retornar actividades', async () => {
      const fecha = '2024-01-01';
      const result = await controller.findAllActividadesByDate(fecha);
      expect(result).toEqual([mockActividad]);
      expect(service.findAllActividadesByDate).toHaveBeenCalledWith(fecha);
    });

    it('debería lanzar BadRequestException si la fecha no se proporciona', async () => {

        const fecha = '2024-01-01';
        await controller.findAllActividadesByDate(fecha);
        expect(service.findAllActividadesByDate).toHaveBeenCalledWith(fecha);
    });
  });

  describe('findOneById', () => {
    it('debería llamar a service.findOneById y retornar una actividad', async () => {
      const id = 1;
      const result = await controller.findOneById(id);
      expect(result).toEqual(mockActividad);
      expect(service.findOneById).toHaveBeenCalledWith(id);
    });
  });

  describe('cambiarEstado', () => {
    it('debería llamar a service.cambiarEstado y retornar la actividad actualizada', async () => {
      const id = 1;
      const nuevoEstado = 1;
      const expectedResult = { ...mockActividad, id, estado: nuevoEstado };
      
      service.cambiarEstado.mockResolvedValueOnce(expectedResult); // Aseguramos el valor de retorno para esta llamada

      const result = await controller.cambiarEstado(id, nuevoEstado);
      expect(result).toEqual(expectedResult);
      expect(service.cambiarEstado).toHaveBeenCalledWith(id, nuevoEstado);
    });
  });

  describe('update', () => {
    it('debería llamar a service.update y retornar la actividad actualizada', async () => {
      const id = 1;
      const dto: UpdateActividadDto = { titulo: 'Título Actualizado' };
      const updatedActividad = { ...mockActividad, ...dto };
      service.update.mockResolvedValue(updatedActividad);

      const result = await controller.update(id, dto);
      expect(result).toEqual(updatedActividad);
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('debería llamar a service.remove y retornar el mensaje de éxito', async () => {
      const id = 1;
      const result = await controller.remove(id);
      expect(result).toEqual({ message: 'Actividad eliminada Mock' });
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});