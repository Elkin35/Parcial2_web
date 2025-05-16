import { IsString, IsNumber, IsNotEmpty, MinLength, Matches, Min, Max, IsIn } from 'class-validator';

export class CreateActividadDto {

    @IsNotEmpty({ message: 'El título es requerido' })
    @IsString({ message: 'El título debe ser una cadena de texto' })
    @MinLength(15, { message: 'El título debe tener al menos 15 caracteres' })
    @Matches(/^[a-zA-Z0-9\s]*$/, { message: 'El título no puede contener símbolos' })
    titulo: string;

    @IsNotEmpty({ message: 'La fecha es requerida' })
    @IsString({ message: 'La fecha debe ser una cadena de texto' })
    fecha: string;

    @IsNotEmpty({ message: 'El cupo máximo es requerido' })
    @IsNumber({}, { message: 'El cupo máximo debe ser un número' })
    @Min(1, { message: 'El cupo máximo debe ser mayor a 0' })
    cupoMaximo: number;

    @IsNumber({}, { message: 'El estado debe ser un número' })
    @IsIn([0, 1, 2], { message: 'El estado debe ser 0, 1 o 2' })
    estado: number = 0; // Por defecto, la actividad se crea como abierta (0)

}
