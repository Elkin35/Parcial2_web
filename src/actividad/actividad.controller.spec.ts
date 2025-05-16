import { Test, TestingModule } from '@nestjs/testing';
import { ActividadController } from './actividad.controller';
import { ActividadService } from './actividad.service';

describe('ActividadController', () => {
  let controller: ActividadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActividadController],
      providers: [ActividadService],
    }).compile();

    controller = module.get<ActividadController>(ActividadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
