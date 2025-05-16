import { IsEmail, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateEstudianteDto {
    @IsInt()
    @IsNotEmpty()
    cedula: number;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsEmail()
    @IsNotEmpty()
    correo: string;

    @IsString()
    @IsNotEmpty()
    programa: string;

    @IsInt()
    @Min(1)
    @Max(10)
    semestre: number;
}