import { PartialType } from '@nestjs/mapped-types';
import { CreateReseñaDto } from './create-reseña.dto';

export class UpdateReseñaDto extends PartialType(CreateReseñaDto) {}
