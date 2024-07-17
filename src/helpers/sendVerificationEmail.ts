import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import VerificationEmail from "../../emails/VerificationEmail";

export const sendVerificationEmail = async (
    email: string,
    username: string,
    verifyCode: string,
): Promise<ApiResponse> => {
    try {
        await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: email,
            subject: "FeedBackFusion Verification email",
            react: VerificationEmail({ username, otp: verifyCode }),
        });
        return { success: true, message: "Verification email sent" };
    } catch (err) {
        console.error("Error sending verification email", err);
        return { success: false, message: "Error sending verification email" };
    }
};
