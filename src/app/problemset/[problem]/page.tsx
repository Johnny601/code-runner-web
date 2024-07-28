import { RequestResult } from "@/types/response";
import { useEffect, useState } from "react";
import ProblemSetCodeRunner from "@/components/ProblemSetCodeRunner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cookies } from "next/headers";

const executorUrl = process.env.NEXT_PUBLIC_EXECUTOR_SERVICE;

const fetchProblem = async (param: { problem: string }, jwt: string) => {
  const response = await fetch(
    `${executorUrl}/problemset/${param.problem}/PYTHON`,
    { headers: { Authorization: "Bearer " + jwt } }
  );
  const result: RequestResult = await response.json();

  return result.data;
};
export default async function ProblemPage({
  params,
}: {
  params: { problem: string };
}) {
  const cookieStore = cookies();
  const jwt = cookieStore.get("jwt")?.value as string;
  const problem: ProblemDetails = await fetchProblem(params, jwt);
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col space-y-6 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        {/* introduction sectoin */}
        <section className="flex-center flex-col">
          <h1 className="text-18-bold">{problem.problemName}</h1>
          <p>{problem.description}</p>
        </section>
        {/* code runner */}
        <ProblemSetCodeRunner
          problemId={problem.problemId}
          problemName={problem.problemName}
          problemDescription={problem.description}
          codeTemplate={problem.codeTemplate}
          credentials={jwt}
        />
        {/* execution result */}
      </div>
    </div>
  );
}
