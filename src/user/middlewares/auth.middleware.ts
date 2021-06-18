import { JWT_SECRET } from '@app/config';
import { ExpressRequest } from '@app/types/expressRequest.interface';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { UserService } from '@app/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(request: ExpressRequest, _: Response, next: NextFunction) {
    if (!request.headers.authorization) {
      request.user = null;
      return next();
    }
    const token = request.headers.authorization.split(' ')[1];
    try {
      const decode: any = verify(token, JWT_SECRET);
      request.user = await this.userService.findById(decode.id);
    } catch (error) {
      request.user = null;
      return next();
    }
    next();
  }
}
