import { UserEntity } from '@app/user/user.entity';

export type UserType = Omit<
  Omit<UserEntity, 'hashUpdatedPassword'>,
  'hashPassword'
>;
