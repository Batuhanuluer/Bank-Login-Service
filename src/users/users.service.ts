import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

    const existingUser = await this.userModel.findOne({
      $or: [{ email: newUser.email }, { phone: newUser.phone }],
    });

    if (existingUser) {
      // Aynı e-posta veya telefon numarası mevcutsa hata döndür
      throw new ConflictException(
        'A user with the same email or phone number already exists.',
      );
    }
    const hashedPassowrd  = await bcrypt.hash(newUser.password,12)
        
    const createdUser = new this.userModel({
        email : newUser.email,
        firstname : newUser.firstName,
        phone : newUser.phone,
        lastname : newUser.lastName,
        password : hashedPassowrd
    })
    await createdUser.save()

    return createdUser
  }

  async login(loginUser : LoginUserdto) {    
    const user = await this.userModel.findOne({phone:loginUser.phone})                

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
     
    return {userJson , token : token}
  }


  async logout(userToken: string) {
    try {
      const verifiedToken = this.jwtService.verify(userToken);

      const phone = verifiedToken.phone; 
    
      await this.redisClient.del(phone);  

      console.log(`User with phone ${phone} has been logged out and removed from Redis.`);


      //Test for the new origin 
    } catch (error) {
      console.error("Error during logout:", error.message);  
      throw error; 
    }
}
}