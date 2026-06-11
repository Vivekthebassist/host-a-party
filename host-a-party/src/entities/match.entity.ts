import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';
import { Message } from './message.entity';

@Entity('matches')
@Unique(['userOneId', 'userTwoId', 'eventId'])
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userOneId' })
  userOne: User;

  @Column()
  userOneId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userTwoId' })
  userTwo: User;

  @Column()
  userTwoId: string;

  @ManyToOne(() => Event, (event) => event.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: string;

  @Column({ default: false })
  isSuperLike: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Message, (msg) => msg.match)
  messages: Message[];
}
