// "use client";

import Link from "next/link";
import { Suspense } from "react";

import UserLoginStatus from "./UserLoginStatus";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  // const router = useRouter();
  return (
    <nav className="h-[7vh] w-full  border-b-2">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-full px-6 lg:px-0">
        <div className="flex items-center space-x-24">
          <Link href="/" className="text-18-bold">
            Evweet.com
          </Link>
          <div className="flex space-betweem">
            {/* <Button
              onClick={() => {
                router.replace("/problemset");
              }}
            >
              Problem set
            </Button> */}
            <Link href="/problemset" className="text-14-medium text-gray-400">
              Problem set
            </Link>
          </div>
        </div>
        <div></div>
        <div className="flex items-center space-x-4">
          <UserLoginStatus />
        </div>
      </div>
    </nav>
  );
}
