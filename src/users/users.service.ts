import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcrypt from "bcrypt"
import { LoginUserdto } from './dto/login-user.dto';
import { JwtService } from "@nestjs/jwt";
import * as Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();  

@Injectable()
export class UsersService {
  private readonly redisClient: Redis.Redis;

  constructor(@InjectModel(User.name) private readonly userModel: Model<User>,
              private readonly jwtService: JwtService,
  ){ 
  this.redisClient = new Redis.Redis({
    username : process.env.REDIS_USERNAME,
    password : process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: 15166
  });}

  async create(newUser: CreateUserDto) {
    const hashedPassowrd  = await bcrypt.hash(newUser.password,12)
    
    console.log(1);
    
    const createdUser = new this.userModel({
        email : newUser.email,
        firstname : newUser.firstName,
        phone : newUser.phone,
        lastname : newUser.lastName,
        password : hashedPassowrd
    })
    console.log(2);

    const test = await createdUser.save()
    console.log(test);

    return createdUser
  }

  async login(loginUser : LoginUserdto) {
    console.log(loginUser);
    
    const user = await this.userModel.findOne({phone:loginUser.phone})            
    console.log(user);
    

    if (!user || !(await bcrypt.compare(loginUser.password, user.password))) {
    throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const token = this.jwtService.sign({phone : user.phone }); 

    const userJson = JSON.stringify({
      phone: user.phone,
      firstname: user.firstname,
      lastname : user.lastname,
    });

    await this.redisClient.set(user.phone, userJson);
     
    return token
  }


  async logout(userToken: string) {
    try {
      console.log(userToken);
      
      const user = await this.redisClient.get(userToken);
      if (user) {
        return user;
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error retrieving data:', error.message);
      throw error;  }
}
}