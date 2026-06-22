import { Controller, Post, Body, Get, UseGuards, Headers, SetMetadata} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/get-rawHeaders.decorator';
import type { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { META_ROLES, RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // @GetUser(['email', 'role', 'fullName']) user: User
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders
  ) {
    return {
      ok: true,
      message: 'Hola mundo Private',
      user,
      userEmail,
      rawHeaders, 
      headers
    }
  }

  @Get('private2')
  //@SetMetadata(META_ROLES, ['admin', 'super-user'])
  @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
  @UseGuards(
    AuthGuard(), // Autenticación
    UserRoleGuard // Autorización
  )
  privateRoute2(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }

  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  privateRoute3(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }

}