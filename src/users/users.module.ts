import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config();  

@Module({
  imports : [MongooseModule.forFeature( [{name :"User", schema : UserSchema}]),
  JwtModule.register({
    secret : process.env.JWT_SECRETKEY,
    signOptions : {expiresIn : process.env.JWT_EXPRESSIN}
})],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
