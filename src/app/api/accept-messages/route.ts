import connectDb from "@/lib/connectDb";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import UserModel from "@/models/User.model";

export async function POST(request: Request) {
  await connectDb();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;
  if (!session || !user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }
  const { isAcceptingMesages } = await request.json();
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      user?._id,
      {
        isAcceptingMessages: isAcceptingMesages,
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found!",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Message acceptance status updated succesfully!",
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

export async function GET(request: Request) {
  await connectDb();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;
  if (!session || !user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }
  try {
    const existingUser = await UserModel.findById(user?._id);
    if(!existingUser){
        return NextResponse.json(
            {
              success: false,
              message: "User not found!",
            },
            { status: 404 }
          );
    }
    return NextResponse.json(
        {
          success: true,
          message: "Message acceptance status fetched succesfully!",
          isAcceptingMessages:existingUser?.isAcceptingMessages
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


