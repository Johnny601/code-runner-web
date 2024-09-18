/* eslint-disable react/no-unescaped-entities */
"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { z } from "zod";
import { RequestResult } from "@/types/response";
import { zodResolver } from "@hookform/resolvers/zod";

import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useUserStore } from "@/zustand/user";

const authUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE;

const formSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export default function LoginForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const authId = searchParams.get("id");
  const authType = searchParams.get("authType");

  const router = useRouter();

  const login = useUserStore((state) => state.login);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // login with username and password
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const submitData = new FormData();
    submitData.append("oAuth2Id", "");
    submitData.append("username", values.username);
    submitData.append("authType", "LOCAL");
    submitData.append("password", values.password);
    const response = await fetch(`${authUrl}/login/authenticate`, {
      method: "POST",
      body: submitData,
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

    login();

    router.push("/problemset");
  }

  // login with OAuth
  useEffect(() => {
    const loginInWithOAuth = async () => {
      if (authId && authType) {
        const submitData = new FormData();
        submitData.append("oAuth2Id", authId);
        submitData.append("username", "");
        submitData.append("authType", authType);
        submitData.append("password", "");
        const response = await fetch(`${authUrl}/login/authenticate`, {
          method: "POST",
          body: submitData,
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

        login();

        router.replace("/problemset");
      }
    };

    loginInWithOAuth();
  }, [authId, authType, login, router, toast]);

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-[360px]"
        >
          {/* field group */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex-between  ">
                    <FormLabel>Password</FormLabel>
                    <p className="underline invisible">Forgot your password?</p>
                  </div>

                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full">
            Login
          </Button>
          <p className="mt-4 text-12-semibold text-center invisible">
            Don't have an account?{" "}
            <span className="underline">Sign Up Now</span>
          </p>
        </form>
      </Form>

      <Separator className="my-6 " />
      {/* OAuth login */}
      <div className="flex flex-col space-y-4">
        <Link
          href={`${authUrl}/oauth2/authorization/github`}
          className=" invisible"
        >
          <Button variant="outline" className="w-full rounded-lg">
            <FcGoogle className="h-4 w-4 mr-2 " />
            Login with Google
          </Button>
        </Link>
        <Link href={`${authUrl}/oauth2/authorization/github`}>
          <Button variant="outline" className="w-full rounded-lg">
            <GitHubLogoIcon className="mr-2" />
            Login with Github
          </Button>
        </Link>
      </div>
    </div>
  );
}
