"use client";

import React from "react";
import { Button } from "./ui/button";
import { User } from "next-auth";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;
  return (
    <nav className="flex shadow-md min-h-16 w-full items-center py-4  px-8 justify-between flex-col md:flex-row gap-3">
      <h2 className="text-2xl font-bold">FeedBackFusion</h2>
      <hr className="w-[100vw] text-gray-500 md:hidden"/>
      {session ? (
        <div className="flex items-center gap-4 justify-between w-full md:w-auto">
          <h3 className="text-lg">
            Welcome,
            <span className="font-medium text-indigo-500">
              {user?.username || user?.email}
            </span>
          </h3>
          <Button
            className="bg-indigo-500 w-max hover:bg-indigo-600 gap-3"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        </div>
      ) : (
        <Link href="/sign-in">
          <Button className="bg-indigo-500 w-max hover:bg-indigo-600 ">
            Login
          </Button>
        </Link>
      )}
    </nav>
  );
}
