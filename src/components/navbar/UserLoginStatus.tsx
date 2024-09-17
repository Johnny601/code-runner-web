"use client";

import { RequestResult } from "@/types/response";
import { useUserStore } from "@/zustand/user";
import Link from "next/link";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

const authUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE;

interface UserLoginStatusProps {
  credentials?: string;
}

export default function UserLoginStatus({ credentials }: UserLoginStatusProps) {
  const { toast } = useToast();
  const { isLoggedIn, logout } = useUserStore();

  const router = useRouter();

  return !isLoggedIn ? (
    <Link
      href="/login"
      className="text-sm font-medium border  py-2 px-4  rounded-lg  border-slate-200  hover:bg-slate-100 hover:text-slate-900"
    >
      Login
    </Link>
  ) : (
    <Link
      href="/logout"
      className="text-sm font-medium border  py-2 px-4  rounded-lg  border-slate-200  hover:bg-slate-100 hover:text-slate-900"
      onClick={async () => {
        const response = await fetch(`${authUrl}/login/authenticate`, {
          method: "POST",
        });

        const result: RequestResult = await response.json();
        if (result.code === 0) {
          return toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }

        logout();

        router.push("/");
      }}
    >
      Logout
    </Link>
  );
}
