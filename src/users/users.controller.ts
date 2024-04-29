import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserdto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() loginuserdto : LoginUserdto) {
    return await this.usersService.login(loginuserdto);
  }

  @Post('logout')
  async logout(
    @Body('usertoken') usertoken : string,
  ){
    await this.usersService.logout(usertoken);
  }

  
} 
