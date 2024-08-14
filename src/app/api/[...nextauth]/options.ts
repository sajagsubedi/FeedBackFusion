import CredentialsProvider from "next-auth/providers/credentials"
import { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';
import connectDb from '@/lib/connectDb';
import UserModel from '@/models/User.model';

export const authOptions:NextAuthOptions={
providers: [
  CredentialsProvider({
    id:'credentials',
    name: 'Credentials',
    credentials: {
      email: { label: "Email", type: "text", placeholder: "example@feedbackfusion.com" },
      password: { label: "Password", type: "password",placeholder: "......." },
    },
    async authorize(credentials:any):Promise<any>{
    await connectDb()
try{
      const user = await UserModel.findOne({
        $or:[
        { email: credentials.identifier },
          {username: credentials.identifier}]});
      if (!user) {
        throw new Error("User not found");
      }
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if (isPasswordValid) {
        return user;
      }else{
        throw new Error("Invalid password");

      }
    
}
      catch(err:any){
        throw new Error(err)
      }
    }
  })
],
  callbacks:{
    async jwt({token,user}){
      if(user){
        token._id=user._id?.toString();
        token.username=user.username;
        token.email=user.email;
        token.isVerified=user.isVerified;
        token.isAcceptingMesages=user.isAcceptingMesages;
      }
      return token;
  
  },
     async session({session,token}){
      if(token){
        session.user._id=token._id;
        session.user.username=token.username;
          session.user.email=token.email;
          session.user.isVerified=token.isVerified;
          session.user.isAcceptingMesages=token.isAcceptingMesages;
      }
      return session;
  
     }
  },
  secret:process.env.SECRET_KEY,
  session:{
    strategy:"jwt"
  },
  pages:{
    signIn:"/sign-in"
  }
}