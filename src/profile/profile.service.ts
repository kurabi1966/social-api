import { Repository } from 'typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { InjectRepository } from '@nestjs/typeorm';

// ===================================================

import { UserEntity } from '@app/user/user.entity';
import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { ProfileType } from './types/profile.type';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: profileUsername,
    });
    if (!user) {
      throw new NotFoundException(`Profile ${profileUsername} does not exist!`);
    }

    // find
    const isFollowing = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: user.id,
    });
    let following = false;
    if (isFollowing) {
      following = true;
    }
    return { ...user, following };
  }

  async follow(currentUserId: number, username: string): Promise<ProfileType> {
    const profile = await this.getProfile(currentUserId, username);
    if (currentUserId === profile.id) {
      throw new BadRequestException(`You are not allowed to follow your self!`);
    }

    if (profile.following) {
      throw new BadRequestException(`You already following ${username}`);
    }
    await this.followRepository.save({
      followerId: currentUserId,
      followingId: profile.id,
    });
    profile.following = true;
    return profile;
  }

  async unfollow(
    currentUserId: number,
    username: string,
  ): Promise<ProfileType> {
    const profile = await this.getProfile(currentUserId, username);
    if (!profile.following) {
      throw new BadRequestException(`You are not following ${username}`);
    }
    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: profile.id,
    });
    profile.following = false;
    return profile;
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    delete profile.id;
    return { profile };
  }
}
