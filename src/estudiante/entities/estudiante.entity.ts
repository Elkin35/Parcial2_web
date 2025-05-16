import { Actividad } from "src/actividad/entities/actividad.entity";
import { Reseña } from "src/reseña/entities/reseña.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Estudiante {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cedula: number;

    @Column()
    nombre: string;

    @Column()
    correo: string;

    @Column()
    programa: string;

    @Column()
    semestre: number;

    @ManyToMany(() => Actividad, actividad => actividad.inscritos)
    actividades: Actividad[];

    @OneToMany(() => Reseña, resena => resena.estudiante)
    reseñas: Reseña[];

}
