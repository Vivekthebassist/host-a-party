import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Event } from './event.entity';
import { JoinRequest } from './join-request.entity';
import { Swipe } from './swipe.entity';
import { Match } from './match.entity';
import { Message } from './message.entity';
import { Notification } from './notification.entity';
import { CheckIn } from './check-in.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Exclude({ toPlainOnly: true })
  @Index()
  @Column({ length: 15, unique: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  idProofUrl: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isProfileComplete: boolean;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  city: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'enum', enum: ['light', 'dark', 'system'], default: 'system' })
  appearance: string;

  @Exclude({ toPlainOnly: true })
  @Column({ default: true })
  locationEnabled: boolean;

  @Exclude({ toPlainOnly: true })
  @Column({ default: true })
  showProfileInPartyMode: boolean;

  @Exclude({ toPlainOnly: true })
  @Column({ default: true })
  pushNotificationsEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Event, (event) => event.host)
  hostedEvents: Event[];

  @OneToMany(() => JoinRequest, (jr) => jr.user)
  joinRequests: JoinRequest[];

  @OneToMany(() => Swipe, (swipe) => swipe.swiper)
  swipesMade: Swipe[];

  @OneToMany(() => Swipe, (swipe) => swipe.swiped)
  swipesReceived: Swipe[];

  @OneToMany(() => Message, (msg) => msg.sender)
  messagesSent: Message[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];

  @OneToMany(() => CheckIn, (ci) => ci.user)
  checkIns: CheckIn[];
}
