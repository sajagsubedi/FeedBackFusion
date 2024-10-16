import connectDb from "@/lib/connectDb";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import UserModel from "@/models/User.model";

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  const { messageId } = params;
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
    const updatedResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );
    if (updatedResult.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Message not found or already deleted!",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Message deleted successfully!",
      },
      { status: 200 }
    )
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
