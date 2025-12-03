import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { RegisterDto } from '@shared-ev/shared-dtos';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('AuthService', 'Register')
  register(data: RegisterDto) {
    return this.appService.register(data);
  }
}
