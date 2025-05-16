import { Estudiante } from "src/estudiante/entities/estudiante.entity";
import { Reseña } from "src/reseña/entities/reseña.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Actividad {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    titulo: string;

    @Column()
    fecha:string;

    @Column()
    cupoMaximo: number;

    @Column()
    estado:number;

    @ManyToMany(() => Estudiante, estudiante => estudiante.actividades)
    inscritos: Estudiante[];

    @OneToMany(() => Reseña, reseña => reseña.actividad)
    reseñas: Reseña[];

}
