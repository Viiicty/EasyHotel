import { Controller, Post, Body, UseGuards, Get, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { Public } from '../common/public.decorator';

@Controller('auth')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name: string,
    @Body('role') role?: string,
  ) {
    const user = await this.userService.create(email, password, name, role);
    const result = { ...user };
    delete result.passwordHash;
    return result;
  }

  @Public()
  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    const user = await this.authService.validateUser(email, password);
    const token = await this.authService.login(user);
    return { user, ...token }
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get('user/:id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Public()
  @Get('phone/:phone')
  async getUserByPhone(@Param('phone') phone: string) {
    return this.userService.findByPhone(phone);
  }

  /*********************小程序 *********************/

  @Public()
  @Post('mini/register')
  async miniRegister(
    @Body('phone') phone: string,
    @Body('password') password: string,
    @Body('name') name: string,
    @Body('email') email?: string,
  ) {
    const user = await this.userService.createMiniUser(phone, password, name, email);
    const token = await this.authService.login(user);
    const result = { ...user, ...token };
    delete result.passwordHash;
    return result;
  }

  @Public()
  @Post('mini/login')
  async miniLogin(@Body('phone') phone: string) {
    const user = await this.userService.findMiniUserByPhone(phone);
    if (!user) {
      return null;
    }
    const token = await this.authService.login(user);
    const result = { ...user, ...token };
    delete result.passwordHash;
    return result;
  }
}
