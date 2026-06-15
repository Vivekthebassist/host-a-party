import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import * as path from 'path';
import { User } from './entities/user.entity';
import { Event } from './entities/event.entity';
import { JoinRequest } from './entities/join-request.entity';
import { Swipe } from './entities/swipe.entity';
import { Match } from './entities/match.entity';
import { Message } from './entities/message.entity';
import { Notification } from './entities/notification.entity';
import { CheckIn } from './entities/check-in.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { JoinRequestsModule } from './join-requests/join-requests.module';
import { ConnectionsModule } from './connections/connections.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CheckInsModule } from './check-ins/check-ins.module';
import { UploadsModule } from './uploads/uploads.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),

        ssl: true,
        entities: [User, Event, JoinRequest, Swipe, Match, Message, Notification, CheckIn],
        synchronize: true,
        logging: ['error', 'warn'],
      }),
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    JoinRequestsModule,
    ConnectionsModule,
    MessagesModule,
    NotificationsModule,
    CheckInsModule,
    UploadsModule,
    GatewayModule,
  ],
})
export class AppModule {}
