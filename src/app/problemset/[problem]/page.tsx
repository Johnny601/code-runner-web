"use client";

import { RequestResult } from "@/types/response";
import { useEffect, useState } from "react";
import ProblemSetCodeRunner from "@/components/ProblemSetCodeRunner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function ProblemPage({
  params,
}: {
  params: { problem: string };
}) {
  const [problemName, setProblemName] = useState("");
  const [executionResult, setExecutionResult] = useState<TestCaseResult[]>([]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col space-y-6 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        {/* introduction sectoin */}
        <section className="flex-center flex-col">
          <h1 className="text-18-bold">{problemName}</h1>
          <p>Execute code in any language you like</p>
        </section>
        {/* code runner */}
        <ProblemSetCodeRunner
          setProblemName={setProblemName}
          setExecutionResult={setExecutionResult}
        />
        {/* execution result */}
        <section className="w-full">
          {executionResult.length != 0 ? (
            <Tabs defaultValue="case 0" className="w-full ">
              <div className="flex items-center gap-5">
                <h2 className="text-14-medium ">Result</h2>
                <TabsList className="h-fit w-fit">
                  {executionResult.map((_, index) => (
                    <TabsTrigger
                      key={index}
                      value={`case ${index + 1}`}
                      className="h-4 rounded-md text-12-regular"
                    >
                      Case {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {executionResult.map((result, index) => (
                <TabsContent
                  key={index}
                  value={`case ${index + 1}`}
                  className="flex"
                >
                  <div className="w-[15%]">
                    {/* input argument */}
                    <p className="text-14-regular pb-1">Input Argument:</p>
                    {result.inputArguments.split(" ").map((arg, index) => (
                      <p key={`input-arg-${index}`} className="text-12-regular">
                        -{">"} {arg}
                      </p>
                    ))}
                    {/* expected result */}
                    <p className="text-14-regular py-1">Correct Answer:</p>
                    <p className=" text-12-semibold ">
                      -{">"} {result.expectedResult}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-14-regular pb-1">Your Answer:</p>
                    <Textarea
                      className="resize-none border-2 border-gray-400 h-[15vh]"
                      disabled
                      value={result.executionResult}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div>
              Press the &quot;Execute&quot; button to see the execution result
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
