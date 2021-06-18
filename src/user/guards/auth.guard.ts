import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { ExpressRequest } from '@app/types/expressRequest.interface';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<ExpressRequest>();
    if (req.user) {
      return true;
    }
    throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
  }
}
