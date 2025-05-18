import { Test, TestingModule } from '@nestjs/testing';
import { EstudianteController } from './estudiante.controller';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { Estudiante } from './entities/estudiante.entity';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto'; // Si lo usas
import { HttpStatus } from '@nestjs/common';

const mockEstudiante: Estudiante = {
  id: 1,
  cedula: 12345,
  nombre: 'Juan Perez Mock',
  correo: 'juan.mock@test.com',
  programa: 'Sistemas Mock',
  semestre: 5,
  actividades: [],
  reseñas: [],
};

// Mock del servicio EstudianteService
const mockEstudianteService = {
  crearEstudiante: jest.fn().mockResolvedValue(mockEstudiante),
  findAll: jest.fn().mockResolvedValue([mockEstudiante]),
  findEstudianteById: jest.fn().mockResolvedValue(mockEstudiante),
  inscribirseActividad: jest.fn().mockResolvedValue({ mensaje: 'Inscripción exitosa Mock' }), // o message
  // update: jest.fn().mockResolvedValue(mockEstudiante), // Si tienes método update
  // remove: jest.fn().mockResolvedValue({ affected: 1 }),  // Si tienes método remove
};

describe('EstudianteController', () => {
  let controller: EstudianteController;
  let service: typeof mockEstudianteService; // Tipado para autocompletado

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstudianteController],
      providers: [
        {
          provide: EstudianteService,
          useValue: mockEstudianteService,
        },
      ],
    }).compile();

    controller = module.get<EstudianteController>(EstudianteController);
    service = module.get(EstudianteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('crearEstudiante', () => {
    it('debería llamar a service.crearEstudiante y retornar el estudiante creado', async () => {
      const dto: CreateEstudianteDto = {
        cedula: mockEstudiante.cedula,
        nombre: mockEstudiante.nombre,
        correo: mockEstudiante.correo,
        programa: mockEstudiante.programa,
        semestre: mockEstudiante.semestre,
      };
      const result = await controller.crearEstudiante(dto);
      expect(result).toEqual(mockEstudiante);
      expect(service.crearEstudiante).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('debería llamar a service.findAll y retornar un array de estudiantes', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockEstudiante]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findEstudianteById', () => {
    it('debería llamar a service.findEstudianteById y retornar un estudiante', async () => {
      const id = 1;
      const result = await controller.findEstudianteById(id);
      expect(result).toEqual(mockEstudiante);
      expect(service.findEstudianteById).toHaveBeenCalledWith(id);
    });
  });

  describe('inscribirseActividad', () => {
    it('debería llamar a service.inscribirseActividad y retornar el mensaje de éxito', async () => {
      const estudianteId = 1;
      const actividadId = 1;
      const expectedResponse = { mensaje: 'Inscripción exitosa Mock' }; // o message
      
      // Asegurarse que el mock devuelva lo esperado para esta llamada específica si es necesario
      service.inscribirseActividad.mockResolvedValueOnce(expectedResponse);

      const result = await controller.inscribirseActividad(estudianteId, actividadId);
      expect(result).toEqual(expectedResponse);
      expect(service.inscribirseActividad).toHaveBeenCalledWith(estudianteId, actividadId);
    });
  });

  // Ejemplo si tuvieras un método update
  // describe('update', () => {
  //   it('should call service.update and return the updated student', async () => {
  //     const id = 1;
  //     const dto: UpdateEstudianteDto = { nombre: 'Nombre Actualizado' };
  //     const updatedStudent = { ...mockEstudiante, ...dto };
  //     service.update.mockResolvedValue(updatedStudent);

  //     const result = await controller.update(id, dto);
  //     expect(result).toEqual(updatedStudent);
  //     expect(service.update).toHaveBeenCalledWith(id, dto);
  //   });
  // });
});