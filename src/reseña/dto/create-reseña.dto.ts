import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReseñaDto {
    @IsNotEmpty()
    @IsString()
    comentario: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    calificacion: number;

    @IsNotEmpty()
    @IsString()
    fecha: string;

    @IsNotEmpty()
    @IsNumber()
    estudianteId: number;

    @IsNotEmpty()
    @IsNumber()
    actividadId: number;
}