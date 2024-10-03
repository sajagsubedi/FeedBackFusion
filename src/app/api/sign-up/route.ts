import User from "@/models/User.model";
import connectDb from "@/lib/connectDb";
import bcryptjs from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { NextResponse } from "next/server";

export const POST=async(request: Request ) => {

  console.log(`Signup`);
  // Connect to the database
  await connectDb();
  try {

const reqBody=await request.json()
    // Get the username, password, and email from the request body
    const { username, password, email } = reqBody;
    // Check if all fields are provided
    if (!username || !password || !email) {
      return NextResponse.json(
        { success: false, message: "Please provide all the fields" },
        {
          status: 400,
        },
      );
    }
    // Check if a user with the same username already exists
    const existingUserWithUsername = await User.findOne({
      username,
      isVerified: true,
    });
    if (existingUserWithUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "User with username already exists",
        },
        {
          status: 400,
        },
      );
    }

    // Check if a user with the same email already exists
    const existingUserWithEmail = await User.findOne({ email });
    // Generate a random verification code
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserWithEmail) {
      // If the user with the same email exists and is verified, return an error
      if (existingUserWithEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "User with email already exists",
          },
          {
            status: 400,
          },
        );
      } else {
        // If the user with the same email exists but is not verified, update the user's information
        const hashedPassword = bcryptjs.hashSync(password, 10);
        const verifyCodeExpiry = new Date(Date.now() + 3600000);
        existingUserWithEmail.password = hashedPassword;
        existingUserWithEmail.verifyCode = verifyCode;
        existingUserWithEmail.username = username;
        existingUserWithEmail.verifyCodeExpiry = verifyCodeExpiry;
        await existingUserWithEmail.save();
      }
    } else {
      // If the user with the same email does not exist, create a new user
      const hashedPassword = bcryptjs.hashSync(password, 10);
      const verifyCodeExpiry = new Date(Date.now() + 3600000);
      const newUser = new User({
        username,
        password: hashedPassword,
        email,
        isVerified: false,
        isAcceptingMesages: true,
        verifyCode,
        verifyCodeExpiry,
        messages: [],
      });
      await newUser.save();
    }
    // Send a verification email to the user
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode,
    );
    if (!emailResponse.success) {
     return NextResponse.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 },
      );
    }
    // Return a success response
    return  NextResponse.json(
      {
        success: true,
        message:
          "User registered successfully.Please verify your email",
      },
      { status: 201 },
    );
  } catch (error:any) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );

    }  
} 