import { Injectable } from '@nestjs/common';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

@Injectable()
export class ActividadService {
  create(createActividadDto: CreateActividadDto) {
    return 'This action adds a new actividad';
  }

  findAll() {
    return `This action returns all actividad`;
  }

  findOne(id: number) {
    return `This action returns a #${id} actividad`;
  }

  update(id: number, updateActividadDto: UpdateActividadDto) {
    return `This action updates a #${id} actividad`;
  }

  remove(id: number) {
    return `This action removes a #${id} actividad`;
  }
}
