"use client";

import { useToast } from "@/hooks/use-toast";
import { Message } from "@/models/User.model";
import { AcceptMessageSchema } from "@/schemas/acceptingMessagesSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Router } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

//Components and ui imports
import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Copy, Loader2, RefreshCcw } from "lucide-react";

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]); //messages to display in card
  const [isLoading, setIsLoading] = useState(false); // for showing loader during fetching from backend
  const [isSwitchLoading, setIsSwitchLoading] = useState(false); // for diabling switch during loading

  const { toast } = useToast(); //initialization of toast

  const handleDeleteMessages = (messageId: string) => {
    setMessages((msgs) => {
      return msgs.filter((msg) => msg._id !== messageId);
    }); //deletimg messages on frontend
  };

  const { data: session } = useSession(); // session of user

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema), //data validation in form through AcceptMessageSchema
  });

  //destructing ( watch to review the switchchange) , (setvalue: to change status acceptMessages after api call) and (register to register the switch change value to form for validation)
  const { watch, setValue, register } = form;

  const acceptMessages = watch("acceptMessages"); //watch the value of form field with name "acceptMessages"

  //function to fetch the status of isAcceptingMessages from api
  const fetchIsAcceptingMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessages", response?.data?.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ??
          "Failed to fetch message settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue,toast]);

  //function to fetch messages for user
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        setMessages(response?.data?.messages || []);
        if (refresh) {
          toast({
            title: "Refreshed Messages",
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description:
            axiosError.response?.data.message ?? "Failed to fetch messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setMessages, toast]
  ); //the function will render again only if setIsLoading, setMessages,toast changes

  // Fetch initial state from the server during component mount and change of session
  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();

    fetchIsAcceptingMessage();
  }, [session, setValue, toast, fetchIsAcceptingMessage, fetchMessages]);

  //function to handle checkbox change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      }); //changing status of isAcceptingMessages in backend
      setValue("acceptMessages", !acceptMessages); //Changing status of isAcceptingMessages in frontend
      toast({
        title: response?.data?.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ??
          "Failed to update message settings",
        variant: "destructive",
      });
    }
  };

  if (!session || !session.user) {
    // router.push("/sign-in");
    return;
  }

  const { username } = session?.user as User;
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL Copied!",
      description: "Profile URL has been copied to clipboard.",
    });
  };

  return (
    <section className="w-full">
      <div className="w-full bg-indigo-50 py-5 md:px-[10vw] px-4">
        <h2 className="font-bold text-2xl">
          Welcome to <span className="text-indigo-500">User</span> Dasboard
        </h2>

        <div className="mt-10 px-5 mb-8 space-y-6">
          <h5 className="text-indigo-950 space-y-4 font-bold text-lg">
            Copy your Unique Link
          </h5>
          <div className="flex gap-3 w-full justify-between ">
            <input
              type="text"
              disabled
              value={profileUrl}
              className="w-full input bordered p-2 rounded"
            />
            <Button
              onClick={copyToClipboard}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              <span className="sr-only">Copy</span> <Copy />
            </Button>
          </div>
          <div className="flex gap-2">
            <Switch
              {...register("acceptMessages")}
              className="bg-indigo-500 text-indigo-500"
              checked={acceptMessages}
              onCheckedChange={handleSwitchChange}
              disabled={isSwitchLoading}
            />
            <p>
              <span className="font-bold">Accepting Messages:</span>{" "}
              {acceptMessages ? "On" : "Off"}
            </p>
          </div>
        </div>
      </div>

      <div className="md:px-[10vw] py-2 px-4">
        <Button
          onClick={() => fetchMessages(true)}
          variant="outline"
          disabled={isLoading}
        >
          <span className="sr-only">Refresh</span>{" "}
          {isLoading ? <Loader2 /> : <RefreshCcw />}
        </Button>
      </div>

      <div className="md:px-[10vw] py-10 px-4">
        {messages.length > 0 ? (
          <div className="grid grid-cols-3 ">
            {messages?.map((message, index) => {
              return (
                <MessageCard
                  key={index}
                  message={message}
                  onMessageDelete={handleDeleteMessages}
                />
              );
            })}
          </div>
        ) : (
          <p>No messages to display</p>
        )}
      </div>
    </section>
  );
}
