import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
// =========================================
import { CreateUserDto } from '@app/user/dtos/create-user.dto';
import { UserEntity } from '@app/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JWT_SECRET } from '@app/config';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from './dtos/login-user.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      {
        email: loginUserDto.email,
      },
      { select: ['id', 'bio', 'image', 'password', 'username', 'email'] },
    );

    if (!user) {
      throw new HttpException(
        'Credentials are not correct',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // check if the password correct
    const isPasswordCorrect = await compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Incorrect Email or Password!',
        HttpStatus.NON_AUTHORITATIVE_INFORMATION,
      );
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      email: createUserDto.email,
    });
    const userByUsername = await this.userRepository.findOne({
      username: createUserDto.username,
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'Email or username are taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne(id);
  }

  private generateJwt(user: UserEntity): string {
    const { id, email, username } = user;
    return sign({ id, email, username }, JWT_SECRET);
  }
}
