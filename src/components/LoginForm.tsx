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
import { GitHubLogoIcon } from "@radix-ui/react-icons";

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

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

    router.push("/problemset");
  }

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

        router.push("/problemset");
      }
    };

    loginInWithOAuth();
  }, [authId, authType, router, toast]);

  return (
    <section>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-[360px]"
        >
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </Form>
      <Separator className="my-4" />
      <Link href={`${authUrl}/oauth2/authorization/github`}>
        <Button variant="outline" className="w-full">
          <GitHubLogoIcon className="mr-2" />
          Login with Github
        </Button>
      </Link>
    </section>
  );
}
