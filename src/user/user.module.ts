import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// =============================================
import { UserController } from '@app/user/user.controller';
import { UserService } from '@app/user/user.service';
import { UserEntity } from '@app/user/user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';
// import { ProfileController } from '@app/user/profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController], // ProfileController],
  providers: [UserService, AuthGuard],
  exports: [UserService],
})
export class UserModule {}
