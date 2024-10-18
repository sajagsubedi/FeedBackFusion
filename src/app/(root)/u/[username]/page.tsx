"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { messageSchema } from "@/schemas/messsageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function Page() {
  // Param hooks to manage navigation and URL params
  const param = useParams<{ username: string }>();
  const { username } = param;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [suggestedMessages, setSuggestedMessages] = useState<string>(
    "What's your favorite genre of books?||What's the most interesting thing you've learned in the past week?||Do you have any book recommendations?"
  );
  const [suggestedMessagesArray, setSuggestedMessagesArray] = useState(
    suggestedMessages.split("||")
  );
  const { toast } = useToast();
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent=form.watch("content")
  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-messages", {
        username,
        content: data.content,
      });
      toast({
        title: "Message sent succesfully!",
      });
      form.setValue("content", "");
    } catch (error) {
      let axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError?.response?.data?.message ||
          `Error sending message to ${username}`,
        variant: "destructive",
      });
      toast;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const handleSuggestMessages = async () => {
    setIsLoadingMessages(true)
    try {
      let response = await axios.get("/api/suggest-messages");
      setSuggestedMessages(response?.data?.messages);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error fetching suggested messages!",
      });
    }finally{
      setIsLoadingMessages(false)
    }
  };

  useEffect(()=>{
    setSuggestedMessagesArray(suggestedMessages.split("||"))
  },[suggestedMessages])
  return (
    <section className="w-full md:px-[20vw] py-10">
      <h3 className="text-4xl text-center font-bold mb-5">Public Profile</h3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col  w-full"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous to @{username}</FormLabel>
                <Textarea
                  {...field}
                  name="content"
                  placeholder="Write anonymous message here"
                  className="h-24"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="bg-indigo-500 w-44 self-center hover:bg-indigo-600 mt-8"
            type="submit"
            disabled={!messageContent || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </Form>
      <Separator className=" m-6" />
      <div className="flex flex-col gap-4">
        <Button
          className="bg-indigo-500 w-max self-start hover:bg-indigo-600 "
          onClick={handleSuggestMessages}
        >
          Suggest Messages
        </Button>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {!isLoadingMessages  && (suggestedMessagesArray.map((message, index) => (
              <Button
                key={index}
                variant="outline"
                className="mb-2"
                onClick={() => handleMessageClick(message)}
              >
                {message}
              </Button>
            )))}
          {
            isLoadingMessages &&
            <Loader2 className="w-16 h-16 mx-auto self-center my-6 animate-spin"/>
          }
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
