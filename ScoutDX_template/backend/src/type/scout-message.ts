import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('scout_messages')
export class ScoutMessageEntity {
  @PrimaryGeneratedColumn({ name: 'scout_message_id' })
  scoutMessageId: number;

  @Column({ name: 'message_content', type: 'text', nullable: true })
  messageContent?: string;

  @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
  status?: string;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt?: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
