import { Actividad } from '../../actividad/entities/actividad.entity';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
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

    @ManyToOne(
      () => Estudiante,
      estudiante => estudiante.reseñas,
      { onDelete: 'CASCADE' }
    )
    estudiante: Estudiante;

    @ManyToOne(
        () => Actividad,
        actividad => actividad.reseñas,
        { onDelete: 'CASCADE' }
    )
    actividad: Actividad;

}