import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { JwtPayloadType } from '@shared-ev/shared-common';
import { lastValueFrom, Observable } from 'rxjs';

interface AuthServiceGrpc {
  verifyAccessToken(data: { token: string }): Observable<JwtPayloadType>;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private authService: AuthServiceGrpc;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    try {
      return await lastValueFrom(this.authService.verifyAccessToken({ token }));
    } catch {
      throw new UnauthorizedException();
    }
  }
}
