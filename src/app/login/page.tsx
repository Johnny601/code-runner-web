"use client";

import LoginForm from "@/components/LoginForm";
import { cookies } from "next/headers";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex flex-col h-[93vh] max-w-5xl mx-auto text-sm pt-24 space-y-16">
      <div className="flex-center flex-col">
        <h1 className="text-16-bold">Welcome</h1>
        <p>Login to your account</p>
      </div>
      <div className="flex-center">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
