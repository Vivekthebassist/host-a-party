import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { JoinRequest } from './join-request.entity';
import { Swipe } from './swipe.entity';
import { Match } from './match.entity';
import { Message } from './message.entity';
import { CheckIn } from './check-in.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  coverImageUrl: string;

  @Column()
  venue: string;

  @Column({ length: 200 })
  address: string;

  @Index()
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Index()
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'timestamp' })
  startsAt: Date;

  @Column({ type: 'timestamp' })
  endsAt: Date;

  @Column({ type: 'int' })
  maxGuests: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.PUBLISHED })
  status: EventStatus;

  @Column({ default: true })
  partyModeEnabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @ManyToOne(() => User, (user) => user.hostedEvents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hostId' })
  host: User;

  @Column()
  hostId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => JoinRequest, (jr) => jr.event)
  joinRequests: JoinRequest[];

  @OneToMany(() => Swipe, (swipe) => swipe.event)
  swipes: Swipe[];

  @OneToMany(() => Match, (match) => match.event)
  matches: Match[];

  @OneToMany(() => Message, (msg) => msg.event)
  messages: Message[];

  @OneToMany(() => CheckIn, (ci) => ci.event)
  checkIns: CheckIn[];
}
