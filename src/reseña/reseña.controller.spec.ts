import { Test, TestingModule } from '@nestjs/testing';
import { ReseñaController } from './reseña.controller';
import { ReseñaService } from './reseña.service';

describe('ReseñaController', () => {
  let controller: ReseñaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReseñaController],
      providers: [ReseñaService],
    }).compile();

    controller = module.get<ReseñaController>(ReseñaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
