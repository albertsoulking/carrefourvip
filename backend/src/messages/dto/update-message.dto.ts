import { PartialType } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  // @IsEnum(MessageStatus)
  // @IsOptional()
  // status?: MessageStatus;
}
