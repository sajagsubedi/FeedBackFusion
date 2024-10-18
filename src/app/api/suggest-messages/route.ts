import { NextResponse } from "next/server";
import { messages } from "@/constants/messages";

export async function GET(req: Request) {
  try {
    // Use current time as a seed to ensure different random numbers each request
    const randomSeed = Date.now();

    // Use the random seed to get more dynamic randomness
    const ind1 = Math.floor((Math.random() * randomSeed) % messages.length);
    const ind2 = Math.floor((Math.random() * (randomSeed + 1)) % messages.length);
    const ind3 = Math.floor((Math.random() * (randomSeed + 2)) % messages.length);

    const msg1 = messages[ind1];
    const msg2 = messages[ind2];
    const msg3 = messages[ind3];

    const suggestedMessages = `${msg1}||${msg2}||${msg3}`;

    return NextResponse.json(
      {
        success: true,
        message: "Messages fetched successfully!",
        messages: suggestedMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
