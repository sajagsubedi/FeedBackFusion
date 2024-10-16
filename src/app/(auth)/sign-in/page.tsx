"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { signInSchema } from "@/schemas/signInSchema";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false); //for showing loader in submit button

  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });
    setIsSubmitting(false)

    if(result?.error){
        toast({
          title: "Sign Up Failed",
          description: result?.error,
          variant: "destructive",
        });
    }
    if(result?.url){
      router.replace("/")
    }
  };
  return (
    <section className="w-full h-screen p-8 flex justify-center md:items-center">
      <div className="w-96 p-8 shadow-2xl rounded-md h-max">
      <h2 className=" text-2xl md:text-3xl mb-4 font-bold title-font text-left ">
                    Hey&#44;<br/>
                        <span className="text-indigo-500">Welcome</span> back. 
                    </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">

            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <Input
                    {...field}
                    name="identifier"
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
                  <Input {...field} name="password" type="password"/>
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
                  "Sign In"
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
          Don't have a account?
          <Link className="text-indigo-500 underline" href="/sign-up">
            Signup
          </Link>
        </p>
      </div>
    </section>
  );
}
