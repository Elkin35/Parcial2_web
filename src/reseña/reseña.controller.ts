import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReseñaService } from './reseña.service';
import { CreateReseñaDto } from './dto/create-reseña.dto';
import { UpdateReseñaDto } from './dto/update-reseña.dto';

@Controller('reseña')
export class ReseñaController {
  constructor(private readonly reseñaService: ReseñaService) {}

  
}
