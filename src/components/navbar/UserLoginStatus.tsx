"use client";

import { RequestResult } from "@/types/response";
import { useUserStore } from "@/zustand/user";
import Link from "next/link";
import { useToast } from "../ui/use-toast";
import { redirect, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ClipLoader } from "react-spinners";
import { useState } from "react";

const authUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE;

export default function UserLoginStatus() {
  const { toast } = useToast();
  const { logout } = useUserStore();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  // const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  async function handleButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    // if the user is not logged in, redirect to login page
    if (!isLoggedIn) return router.push("/login");

    // setIsLoading(true);

    // if the user is logged in, log them out and redirect to home page
    const response = await fetch(`${authUrl}/login/logout`, {
      method: "POST",
      credentials: "include",
    });

    const result: RequestResult = await response.json();
    if (result.code === 0) {
      return toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }

    // setIsLoading(false);

    logout();

    // full page reload to ensure the user cannot access the previous page
    window.location.href = "/";
  }

  return (
    <Button
      variant="outline"
      className="text-sm font-medium h-9 py-2 px-4  w-24"
      disabled={isLoggedIn === null}
      onClick={handleButtonClick}
    >
      {isLoggedIn === null ? "" : isLoggedIn ? "Logout" : "Login"}
    </Button>
  );
}
