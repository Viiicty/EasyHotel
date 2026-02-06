import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name: string,
  ) {
    const user = await this.userService.create(email, password, name);
    // 不返回密码
    const result = { ...user };
    return result;
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    const user = await this.authService.validateUser(email, password);
    console.log(user)
    const loginResult = await this.authService.login(user);
    return {
      code: 200,
      data: {
        user,
        access_token: loginResult.access_token
      }
    };
  }

  @UseGuards(AuthGuard())
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }
}