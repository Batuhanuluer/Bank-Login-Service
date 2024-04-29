import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>

@Schema()
export class User {
    @Prop({required:true})
    email : string ;    

    @Prop({reguired  : true})
    firstname : string ;

    @Prop({reguired  : true})
    lastname : string ;

    @Prop({reguired  : true})
    password : string ;

    @Prop({required: true})
    phone : string ;

}

export const UserSchema = SchemaFactory.createForClass(User)