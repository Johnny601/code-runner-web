"use client";

import { User } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { useEffect } from "react";

import UserLoginStatus from "./UserLoginStatus";

export default function Navbar() {
  return (
    <nav className="h-[7vh] w-full  border-b-2">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-18-bold">
            Evweet.com
          </Link>
        </div>
        <div>
          <Link href="/problemset">Problem set</Link>
        </div>
        <div className="flex items-center space-x-4">
          <UserLoginStatus credentials={"123"} />
        </div>
      </div>
    </nav>
  );
}
