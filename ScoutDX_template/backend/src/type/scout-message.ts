import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("scout_messages")
export class ScoutMessageEntity {
  @PrimaryGeneratedColumn({ name: "scout_message_id" })
  scoutMessageId: number;

  @Column({ name: "message_content", type: "text", nullable: true })
  messageContent?: string;

  @Column({ name: "sent_at", type: "timestamp", nullable: true })
  sentAt?: Date;

  @Column({ name: "job_posting_id", type: "int", nullable: true })
  jobPostingId?: number;

  @Column({ name: "job_seeker_id", type: "int", nullable: true })
  jobSeekerId?: number;

  @Column({
    name: "created_by_employee_id",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  createdByEmployeeId?: string;

  @Column({
    name: "updated_by_employee_id",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  updatedByEmployeeId?: string;

  @Column({ name: "status", type: "varchar", length: 50, nullable: true })
  status?: string;

  @Column({ name: "created_at", type: "timestamp", nullable: true })
  createdAt?: Date;

  @Column({ name: "updated_at", type: "timestamp", nullable: true })
  updatedAt?: Date;
}
