import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  OnModuleInit,
  Post,
} from '@nestjs/common';
import { RegisterDto } from '@shared-ev/shared-dtos';
import { lastValueFrom, Observable } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';

interface RegisterResponse {
  userId: string;
  status: string;
  error: string;
}

interface AuthServiceGrpc {
  register(data: RegisterDto): Observable<RegisterResponse>;
}

@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService: AuthServiceGrpc;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      const result = await lastValueFrom(this.authService.register(body));

      if (result.error) {
        throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
      }
      return result;
    } catch (e) {
      throw new HttpException(
        e.details || e.message || 'Lỗi Server',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
