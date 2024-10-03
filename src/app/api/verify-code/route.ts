import connectDb from "@/lib/connectDb";
import UserModel from "@/models/User.model";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  await connectDb();
  try {
    const { username, verificationCode } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User does not exists!",
        },
        { status: 404 }
      );
    }
    const isCodeValid = user?.verifyCode == verificationCode;
    const isCodeNotExpired = new Date(user?.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return NextResponse.json(
        {
          success: true,
          message: "Your account has been verified!",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code expired!. Please signup again to gain new verification code",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect verification code!",
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
