import { Module } from '@nestjs/common';
import { ReseñaService } from './reseña.service';
import { ReseñaController } from './reseña.controller';

@Module({
  controllers: [ReseñaController],
  providers: [ReseñaService],
})
export class ReseñaModule {}
