import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface';
import { Auth } from '../auth/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  //@Auth(ValidRoles.admin)
  execute() {
    return this.seedService.run();
  }
}
