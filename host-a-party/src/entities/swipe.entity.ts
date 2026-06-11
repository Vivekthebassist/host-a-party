import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';

export enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right',
  SUPER_LIKE = 'super_like',
}

@Entity('swipes')
@Unique(['swiperId', 'swipedId', 'eventId'])
export class Swipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.swipesMade, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'swiperId' })
  swiper: User;

  @Column()
  swiperId: string;

  @ManyToOne(() => User, (user) => user.swipesReceived, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'swipedId' })
  swiped: User;

  @Column()
  swipedId: string;

  @ManyToOne(() => Event, (event) => event.swipes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: string;

  @Column({ type: 'enum', enum: SwipeDirection })
  direction: SwipeDirection;

  @CreateDateColumn()
  createdAt: Date;
}
