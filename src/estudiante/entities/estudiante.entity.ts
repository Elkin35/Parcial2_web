
import { Actividad } from '../../actividad/entities/actividad.entity';
import { Reseña } from '../../reseña/entities/reseña.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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
    @JoinTable()
    actividades: Actividad[];

    @OneToMany(() => Reseña, resena => resena.estudiante)
    reseñas: Reseña[];
}