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

interface ProblemSetCodeRunnerProps {
  setProblemName: React.Dispatch<React.SetStateAction<string>>;
  setExecutionResult: React.Dispatch<React.SetStateAction<TestCaseResult[]>>;
}

const formSchema = z.object({
  progLang: z.string(),
  codeToExecute: z.string(),
});

export default function ProblemSetCodeRunner({
  setProblemName,
  setExecutionResult,
}: ProblemSetCodeRunnerProps) {
  const { toast } = useToast();

  const param = useParams<{ problem: string }>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      progLang: "PYTHON",
      codeToExecute: "",
    },
  });

  const [problemId, setProblemId] = useState(-1);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    // check if the programmig language is selected
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
      response = await fetch("http://localhost:63010/executor/problemset/run", {
        method: "POST",
        body: submitData,
      });
    } catch (error) {
      return toast({
        title: "Error",
        description: "Internal server error. Please try again later",
        variant: "destructive",
      });
    }

    const result: RequestResult = await response.json();
    console.log(result);

    // some problems with the server
    if (result.code !== 1) {
      return toast({
        title: "Error",
        description: "Internal server error. Please try again later",
        variant: "destructive",
      });
    }

    const resultData: { testCaseResults: TestCaseResult[] } = result.data;
    setExecutionResult(resultData.testCaseResults);
  }

  function handleEditorWillMount(monaco: Monaco) {
    monaco.editor.defineTheme("lightTheme", editorLightTheme);
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://localhost:63010/executor/problemset/${param.problem}/PYTHON`
      );
      const result: RequestResult = await response.json();
      const data: ProblemCodeTemplate = result.data;

      setProblemId(data.problemId);
      setProblemName(data.problemName);
      form.setValue("codeToExecute", data.codeTemplate);
    };

    console.log("fetching data");

    fetchData();
  }, [param.problem, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="flex-between">
          <FormField
            control={form.control}
            name="progLang"
            render={({ field }) => (
              <FormItem className="w-[240px]">
                <Select
                  onValueChange={field.onChange}
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
  );
}
