import {  IsNotEmpty } from "class-validator";


export class LoginUserdto{
    @IsNotEmpty()
    phone : string;

    @IsNotEmpty()
    password : string;
}