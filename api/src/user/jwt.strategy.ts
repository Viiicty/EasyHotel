import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from './user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    console.log('JWT_SECRET:', ExtractJwt.fromAuthHeaderWithScheme('Bearer'))
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { passwordHash: _, ...result } = user;
    return result;
  }
}