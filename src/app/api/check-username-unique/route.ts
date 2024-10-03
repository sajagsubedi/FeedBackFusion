import { usernameValidation } from "@/schemas/signUpSchema";
import connectDb from "@/lib/connectDb";
import UserModel from "@/models/User.model";
import { z } from "zod";
import { NextResponse } from "next/server";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export const GET = async (request: Request) => {
  await connectDb();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    const result = UsernameQuerySchema.safeParse(queryParam);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return NextResponse.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid Query parameters",
        },
        { status: 400 }
      );
    }
    const { username } = result?.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingVerifiedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with username already exists!",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Username is available!",
      },
      { status: 200 }
    );
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
