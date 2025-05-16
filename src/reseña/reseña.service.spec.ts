import { Test, TestingModule } from '@nestjs/testing';
import { ReseñaService } from './reseña.service';

describe('ReseñaService', () => {
  let service: ReseñaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReseñaService],
    }).compile();

    service = module.get<ReseñaService>(ReseñaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
