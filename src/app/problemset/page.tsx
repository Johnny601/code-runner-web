import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { problemSet } from "@/constants/problemSet";
import { cn } from "@/lib/utils";
import { RequestResult } from "@/types/response";
import { CheckIcon } from "@radix-ui/react-icons";
import { cookies } from "next/headers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const executorUrl = process.env.NEXT_PUBLIC_EXECUTOR_SERVICE;

async function fetchDemoProblem() {
  const cookieStore = cookies();
  const response = await fetch(`${executorUrl}/problemset`, {
    headers: {
      Authorization: "Bearer " + cookieStore.get("jwt")?.value,
    },
    cache: "no-store",
  });
  const result: RequestResult = await response.json();

  return result.data;
}

export default async function ProblemSetPage() {
  const demoProblems: DemoProblem[] = await fetchDemoProblem();

  return (
    <div className="flex flex-col min-h-screen items-center p-24 border-2">
      <div className="w-full max-w-5xl space-y-16 text-sm ">
        <section className="flex-center flex-col">
          <h1 className="text-18-bold">Programming Exercises</h1>
          <p>Pick one to solve</p>
        </section>
        <div className="flex flex-col gap-4 items-center justify-between  ">
          {demoProblems.map((problem) => (
            <Link
              href={`/problemset/${problem.pathname}`}
              key={`${problem.id}`}
            >
              <Card className="w-[380px] hover:shadow-lg ">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xl">{problem.name}</CardTitle>
                  {problem.solved && (
                    <Badge id="123 m" variant="success" className="m-0">
                      Solved
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="">
                  <div>
                    <Badge variant="outline">{problem.difficulty}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
