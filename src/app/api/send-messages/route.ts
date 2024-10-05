import connectDb from "@/lib/connectDb";
import { NextResponse } from "next/server";
import UserModel, { Message } from "@/models/User.model";

export async function POST(request: Request) {
  await connectDb();
  const {username, content}=await request.json();
  try{
    const user=await UserModel.findOne({username}).exec()
    if (!user){
      return NextResponse.json(
        {
          success: false,
          message: "User not found!",
        },
        { status: 404 }
      );
    }
    if(!user.isAcceptingMessages){
      return NextResponse.json(
        {
          success: false,
          message: "User is not accepting messages!",
        },
        { status: 403 }
      );
    }
    const newMessage={content,createdAt:new Date()}
    user.messages.push(newMessage as Message)
    await user.save()
    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully!",
      },
      { status: 200 }
    );

   } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
