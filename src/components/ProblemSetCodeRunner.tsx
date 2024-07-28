"use client";

import { Form } from "@/components/ui/form";
import { z } from "zod";
import { FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Editor, Monaco } from "@monaco-editor/react";
import { editorLightTheme } from "@/config/monacoTheme";
import { Button } from "./ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "./ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestResult } from "@/types/response";
import { playgroundDefaultCode } from "@/constants";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { get } from "http";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";

const executorUrl = process.env.EXECUTOR_SERVICE;

interface ProblemSetCodeRunnerProps {
  setProblemName: React.Dispatch<React.SetStateAction<string>>;
  setProblemDescription: React.Dispatch<React.SetStateAction<string>>;
  setExecutionResult: React.Dispatch<
    React.SetStateAction<ProblemExecutionResult>
  >;
}

interface ProblemSetCodeRunnerProps2 {
  problemId: number;
  problemName: string;
  problemDescription: string;
  codeTemplate: string;
  credentials: string;
}

const formSchema = z.object({
  progLang: z.string(),
  codeToExecute: z.string(),
});

export default function ProblemSetCodeRunner({
  problemId,
  problemName,
  problemDescription,
  codeTemplate,
  credentials,
}: ProblemSetCodeRunnerProps2) {
  const { toast } = useToast();

  const param = useParams<{ problem: string }>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      progLang: "PYTHON",
      codeToExecute: codeTemplate,
    },
  });

  const [executionResult, setExecutionResult] =
    useState<ProblemExecutionResult>({
      correctTestCases: -1,
      testCaseResults: [],
    });
  const testCases = executionResult.testCaseResults;

  const fetchProblemCodeTemplate = async () => {
    let result: RequestResult;

    try {
      const response = await fetch(
        `${executorUrl}/problemset/${param.problem}/${form.getValues(
          "progLang"
        )}`,
        { headers: { Authorization: "Bearer " + credentials } }
      );
      result = await response.json();
    } catch (error) {
      return toast({
        title: "Error",
        description: "Internal server error. Please try again later",
        variant: "destructive",
      });
    }

    const data: ProblemDetails = result.data;

    // setProblemName(data.problemName);
    // setProblemDescription(data.description);
    form.setValue("codeToExecute", data.codeTemplate);

    // console.log(data);
  };

  function onSelectChange(value: string) {
    form.setValue("progLang", value);
    fetchProblemCodeTemplate();
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    // check if the programming language is selected
    if (values.progLang === "") {
      return toast({
        title: "Error",
        description: "Please select a programming language",
        variant: "destructive",
      });
    }

    const submitData = new FormData();
    submitData.append("problemId", problemId.toString());
    submitData.append("progLang", values.progLang);
    submitData.append("codeToExecute", values.codeToExecute);

    let response = null;
    try {
      response = await fetch(`${executorUrl}/problemset/run`, {
        method: "POST",
        body: submitData,
        headers: { Authorization: "Bearer " + credentials },
      });
    } catch (error) {
      return toast({
        title: "Error",
        description: "Internal server error. Please try again later",
        variant: "destructive",
      });
    }

    const result: RequestResult = await response.json();

    // some problems with the server
    if (result.code !== 1) {
      return toast({
        title: "Error",
        description: "Internal server error. Please try again later",
        variant: "destructive",
      });
    }

    const resultData: ProblemExecutionResult = result.data;
    setExecutionResult(resultData);
    return toast({
      title: "Success",
      description: "Code executed successfully",
      variant: "default",
    });
  }

  function handleEditorWillMount(monaco: Monaco) {
    monaco.editor.defineTheme("lightTheme", editorLightTheme);
  }

  // useEffect(() => {
  //   fetchProblemCodeTemplate();
  //   console.log("fetching data");
  // }, []);

  return (
    <div className="w-full space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <div className="flex-between">
            <FormField
              control={form.control}
              name="progLang"
              render={({ field }) => (
                <FormItem className="w-[240px]">
                  <Select
                    onValueChange={onSelectChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PYTHON">Python</SelectItem>
                      <SelectItem value="JAVA">Java</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-x-3 items-end flex">
              <Button
                type="submit"
                className="w-20"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <ReloadIcon className="animate-spin" />
                ) : (
                  "Execute"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue("codeToExecute", "")}
              >
                Clear
              </Button>
            </div>
          </div>
          {/* code playground */}
          <FormField
            control={form.control}
            name="codeToExecute"
            render={({ field }) => (
              <FormItem className="border-4">
                <FormControl>
                  <Editor
                    theme="lightTheme"
                    options={{
                      minimap: { enabled: false },
                      renderLineHighlight: "line",
                    }}
                    height="40vh"
                    language={form.getValues("progLang").toLowerCase()}
                    defaultLanguage={form.getValues("progLang").toLowerCase()}
                    value={field.value}
                    onChange={field.onChange}
                    beforeMount={handleEditorWillMount}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <section className="w-full space-y-2">
        {testCases.length != 0 ? (
          <Tabs defaultValue="case 1" className="w-full ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <h2 className="text-14-medium ">Result</h2>
                <TabsList className="h-fit w-fit">
                  {testCases.map((_, index) => (
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

              <Badge
                variant={`${
                  executionResult.correctTestCases === testCases.length
                    ? "success"
                    : "destructive"
                }`}
                className=""
              >
                Correctness: {executionResult.correctTestCases}/
                {testCases.length}
              </Badge>
            </div>

            {testCases.map((result, index) => (
              <TabsContent key={index} value={`case ${index + 1}`}>
                <div className="flex">
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
  );
}
