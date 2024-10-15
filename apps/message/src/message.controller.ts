import {
  BadRequestException,
  ConflictException,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateMessageInterface } from './interfaces/create-message.interface';
import { ReadMessageInterface } from './interfaces/read-message.interface';
import { GetAllMessagesInterface } from './interfaces/get-all-messages.interface';
import { GetCertainFriendConversationInterface } from './interfaces/get-certain-friend-conversation.interface';
import { DeleteMessagesForDeleteAccountDto } from './dto/delete-messages-for-delete-account.dto';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @MessagePattern('create_message')
  async createMessage(
    @Payload() { userPayload, payload }: CreateMessageInterface,
  ) {
    try {
      const result = await this.messageService.createMessage(
        userPayload,
        payload,
      );
      return {
        status: HttpStatus.CREATED,
        message: 'Created message successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('read_messages')
  async readMessages(
    @Payload() { userPayload, payload }: ReadMessageInterface,
  ) {
    try {
      await this.messageService.readMessages(userPayload, payload);
      return {
        status: HttpStatus.OK,
        message: 'Read messages successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('get_all_conversations')
  async getAllConversations(
    @Payload() { userPayload }: GetAllMessagesInterface,
  ) {
    try {
      const result = await this.messageService.getAllConversations(userPayload);
      return {
        status: HttpStatus.OK,
        message: 'Get all friend conversations successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('get_certain_friend_conversation')
  async getCertainFriendConversation(
    @Payload() { userPayload, payload }: GetCertainFriendConversationInterface,
  ) {
    try {
      const result = await this.messageService.getCertainFriendConversation(
        userPayload,
        payload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Get friend conversation successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @EventPattern('delete_messages_for_delete_account')
  async deleteAllMessagesForDeleteAccount(
    @Payload() dto: DeleteMessagesForDeleteAccountDto,
  ) {
    try {
      await this.messageService.deleteAllMessagesForDeleteAccount(dto);
    } catch (error) {
      console.log(error);
    }
  }

  private handleError(error: any) {
    console.log(error);
    if (error instanceof ConflictException) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: error.message,
        error: 'Conflict',
      };
    }

    if (error instanceof NotFoundException) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message,
        error: 'Not Found',
      };
    }

    if (error instanceof BadRequestException) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        error: 'Bad Request',
      };
    }

    if (error instanceof UnauthorizedException) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: error.message,
        error: 'Unauthorized',
      };
    }

    if (error instanceof InternalServerErrorException) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        error: 'Internal Server Error',
      };
    }

    // Default case for other errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message,
      error: 'Internal Server Error',
    };
  }
}
