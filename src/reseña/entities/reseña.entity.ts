import { Actividad } from "src/actividad/entities/actividad.entity";
import { Estudiante } from "src/estudiante/entities/estudiante.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Reseña {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    comentario: string;

    @Column()
    calificacion: number;

    @Column()
    fecha: string;

    @ManyToOne(() => Estudiante, estudiante => estudiante.reseñas)
    estudiante: Estudiante;

    @ManyToOne(() => Actividad, actividad => actividad.reseñas)
    actividad: Actividad;

}