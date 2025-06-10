import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TipoLancamento {
  CREDITO = 'CREDITO',
  DEBITO = 'DEBITO'
}

@Entity('lancamentos')
export class Lancamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  dataLancamento!: Date;

  @Column({ type: 'varchar', length: 255 })
  descricao!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor!: number;

  @Column({
    type: 'enum',
    enum: TipoLancamento
  })
  tipo!: TipoLancamento;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}