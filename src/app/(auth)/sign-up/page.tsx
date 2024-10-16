"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signUpSchema } from "@/schemas/signUpSchema";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState(""); //message from api on checking username validation
  const [isCheckingUsername, setIsCheckingUsername] = useState(false); //for showing loader below username input
  const [isSubmitting, setIsSubmitting] = useState(false); //for showing loader in submit button

  const [debouncedUsername, setDebouncedUsername] = useDebounceValue(
    username,
    300
  );

  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const checkUserNameUnique = async () => {
    if (debouncedUsername) {
      setIsCheckingUsername(true);
      setUsernameMessage("");
      try {
        const response = await axios.get<ApiResponse>(
          `/api/check-username-unique?username=${debouncedUsername}`
        );
        setUsernameMessage(response?.data?.message);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(
          axiosError?.response?.data?.message || "Error checking username"
        );
      } finally {
        setIsCheckingUsername(false);
      }
    }
  };

  useEffect(() => {
    checkUserNameUnique();
  }, [debouncedUsername]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);

      toast({
        title: "Success",
        description: response.data.message,
      });

      router.replace(`/verify/${username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError?.response?.data?.message ||
        "There was a problem during signup. Please try again later ";

      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="w-full h-screen p-8 flex justify-center md:items-center">
      <div className="w-96 p-8 shadow-2xl rounded-md h-max">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Get <span className="text-indigo-500 ">started</span> with
          Us
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    {...field}
                    placeholder="johndoe"
                    onChange={(e) => {
                      field.onChange(e);
                      setUsername(e.target.value);
                    }}
                  />
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === "Username is available!"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input
                    {...field}
                    name="email"
                    placeholder="johndoe@example.com"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input {...field} name="password" placeholder="••••••••" type="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button
                className="bg-indigo-500 w-full hover:bg-indigo-600 mt-8"
                type="submit" disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </div>
          </form>
        </Form>
        <div className="mt-5 flex items-center gap-2 justify-center text-gray-500">
          <hr className="w-[175px] h-[2px] bg-gray-200" />
          or
          <hr className="w-[175px]  h-[2px] bg-gray-200" />
        </div>
        <p
          className="flex gap-2 text-sm justify-end 
                    mt-6"
        >
          Already have a account?
          <Link className="text-indigo-500 underline" href="/sign-in">
            Signin
          </Link>
        </p>
      </div>
    </section>
  );
}
