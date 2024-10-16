import * as React from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Card } from "@/components/ui/card";
import { Message } from "@/models/User.model";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";

interface MessageCardProps {
  message: Message;
  onMessageDelete: (messageId: string) => void;
}

export default function MessageCard({
  message,
  onMessageDelete,
}: MessageCardProps) {
  const { toast } = useToast();
  const deleteMessage = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message?._id}`
      );

      toast({
        title: response.data.message,
      });
      onMessageDelete(message?._id as string);
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to delete message",
        variant: "destructive",
      });
    }
  };
  return (
    <Card className="w-[350px] flex flex-col p-4 pb-8 space-y-1 gap-0">
      <Dialog>
        <DialogTrigger className="self-end p-0" asChild>
          <Button className="bg-transparent p-0 hover:bg-transparent  shadow-none m-0 text-sm">
            <Trash2 className="text-rose-500" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this
              message.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={deleteMessage}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col space-y-2">
        <h4 className="text-xl font-bold">{message.content}</h4>
        <p className="text-sm">
          {dayjs(message.createdAt).format("MMM D, YYYY h:mm A")}
        </p>
      </div>
    </Card>
  );
}
