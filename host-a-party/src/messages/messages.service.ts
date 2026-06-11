import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Match } from '../entities/match.entity';
import { User } from '../entities/user.entity';
import { SendMessageDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly gateway: AppGateway,
  ) {}

  private async verifyMatchAccess(matchId: string, userId: string): Promise<Match> {
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Match not found');
    if (match.userOneId !== userId && match.userTwoId !== userId) {
      throw new ForbiddenException('You are not part of this match');
    }
    return match;
  }

  async send(matchId: string, senderId: string, dto: SendMessageDto): Promise<Message> {
    const match = await this.verifyMatchAccess(matchId, senderId);

    const message = this.messageRepo.create({
      matchId,
      senderId,
      eventId: match.eventId,
      content: dto.content,
      type: dto.type || 'text',
    });
    const saved = await this.messageRepo.save(message);

    this.gateway.emitNewMessage(matchId, saved);

    const receiverId = match.userOneId === senderId ? match.userTwoId : match.userOneId;
    const sender = await this.userRepo.findOne({ where: { id: senderId }, select: { id: true, fullName: true } });

    // Fire-and-forget -- don't block the message send on notification delivery
    this.notificationsService.create(
      receiverId,
      NotificationType.NEW_MESSAGE,
      `${sender?.fullName || 'Someone'}`,
      dto.content.length > 100 ? dto.content.substring(0, 97) + '...' : dto.content,
      { matchId, messageId: saved.id, senderId },
    ).catch(() => {});

    return saved;
  }

  async getChatHistory(matchId: string, userId: string, page = 1, limit = 50) {
    await this.verifyMatchAccess(matchId, userId);

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { matchId },
      relations: { sender: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      messages: messages.reverse(),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(matchId: string, userId: string): Promise<void> {
    await this.verifyMatchAccess(matchId, userId);

    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('matchId = :matchId AND senderId != :userId AND isRead = false', {
        matchId,
        userId,
      })
      .execute();
  }

  async getChatList(userId: string) {
    const matches = await this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.userOne', 'userOne')
      .leftJoinAndSelect('match.userTwo', 'userTwo')
      .leftJoinAndSelect('match.event', 'event')
      .where('(match.userOneId = :userId OR match.userTwoId = :userId)', { userId })
      .orderBy('match.createdAt', 'DESC')
      .getMany();

    const chatList = await Promise.all(
      matches.map(async (match) => {
        const lastMessage = await this.messageRepo.findOne({
          where: { matchId: match.id },
          order: { createdAt: 'DESC' },
        });

        const unreadCount = await this.messageRepo.count({
          where: {
            matchId: match.id,
            isRead: false,
            senderId: match.userOneId === userId ? match.userTwoId : match.userOneId,
          },
        });

        const otherUser = match.userOneId === userId ? match.userTwo : match.userOne;

        return {
          matchId: match.id,
          eventId: match.eventId,
          eventTitle: match.event.title,
          otherUser: {
            id: otherUser.id,
            fullName: otherUser.fullName,
            username: otherUser.username,
            avatarUrl: otherUser.avatarUrl,
          },
          lastMessage: lastMessage
            ? { content: lastMessage.content, createdAt: lastMessage.createdAt, senderId: lastMessage.senderId }
            : null,
          unreadCount,
          isSuperLike: match.isSuperLike,
          matchedAt: match.createdAt,
        };
      }),
    );

    return chatList.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.matchedAt;
      const bTime = b.lastMessage?.createdAt || b.matchedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }
}
