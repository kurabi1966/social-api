import { IsEmail, IsOptional, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  readonly username: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  readonly bio: string;

  @IsOptional()
  readonly image: string;

  @IsOptional()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  readonly password: string;
}
