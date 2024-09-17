"use client";

import LoginForm from "@/components/LoginForm";
import { cookies } from "next/headers";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="grid h-[93vh] grid-flow-col grid-rows-8 max-w-5xl mx-auto text-sm">
      <div className=" row-span-2 flex-center flex-col ">
        <h1 className="text-16-bold">Welcome</h1>
        <p>Login to your account</p>
      </div>
      <div className="row-span-3  flex-center ">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
