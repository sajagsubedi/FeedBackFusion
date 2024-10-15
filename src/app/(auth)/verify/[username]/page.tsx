"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod"; // Import Zod for schema validation
import axios, { AxiosError } from "axios"; // Axios for API requests
import { Form, FormField } from "@/components/ui/form"; // Custom form components
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"; // Custom OTP input components
import { Loader2 } from "lucide-react"; // Loader icon
import { Button } from "@/components/ui/button"; // Custom button component
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema"; // Validation schema for verification code
import { ApiResponse } from "@/types/ApiResponse"; // Custom type for API response
import { useToast } from "@/hooks/use-toast"; // Custom toast notification hook

export default function Page() {
  // Router and param hooks to manage navigation and URL params
  const router = useRouter();
  const param = useParams<{ username: string }>();

  // State for managing loading status during verification
  const [isVerifying, setIsVerifying] = useState(false);

  // Toast hook for showing notifications
  const { toast } = useToast();

  // React Hook Form with Zod schema validation
  const form = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
  });

  // Submit handler for the form
  const onSubmit = async (data: z.infer<typeof verifyCodeSchema>) => {
    setIsVerifying(true); // Set loading state to true

    try {
      // Make a POST request to verify the code
      const response = await axios.post<ApiResponse>("/api/verify-code", {
        username: param.username, // Pass the username from URL params
        verificationCode: data.code, // Pass the entered verification code
      });

      // Show success notification on successful verification
      toast({
        title: "Success",
        description: response.data.message,
      });

      // Redirect to sign-in page on success
      router.replace(`/signin`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      // Extract error message from the response or use default error message
      let errorMessage =
        axiosError?.response?.data?.message ||
        "There was a problem verifying your account. Please try again later.";

      // Show error notification on failure
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false); // Reset loading state after the request
    }
  };

  // State for managing the OTP input value
  const [otp, setOtp] = useState<string>("");

  return (
    <section className="w-full h-screen flex justify-center py-24">
      <div className="w-[30rem] shadow-2xl rounded py-8 px-6 flex flex-col items-center h-max">
        {/* Header */}
        <h2 className="text-4xl font-bold text-center mb-2">
          Verify your Account
        </h2>
        <p className="mb-8 text-gray-600 text-center">
          Enter the verification code sent to your email.
        </p>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Input */}
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <InputOTP maxLength={6} {...field} name="code">
                  <InputOTPGroup>
                    {/* OTP slots for the first 3 digits */}
                    <InputOTPSlot index={0} className="h-12 w-12" />
                    <InputOTPSlot index={1} className="h-12 w-12" />
                    <InputOTPSlot index={2} className="h-12 w-12" />
                  </InputOTPGroup>

                  {/* Separator between OTP groups */}
                  <InputOTPSeparator />

                  <InputOTPGroup>
                    {/* OTP slots for the last 3 digits */}
                    <InputOTPSlot index={3} className="h-12 w-12" />
                    <InputOTPSlot index={4} className="h-12 w-12" />
                    <InputOTPSlot index={5} className="h-12 w-12" />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />

            {/* Submit button */}
            <Button className="bg-indigo-500 w-full hover:bg-indigo-600" type="submit">
              {isVerifying ? (
                <>
                  {/* Loader icon during submission */}
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
