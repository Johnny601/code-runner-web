"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { playgroundDefaultCode } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor, Monaco } from "@monaco-editor/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { editorLightTheme } from "@/config/monacoTheme";
import { RequestResult } from "@/types/response";

const executorUrl = process.env.NEXT_PUBLIC_EXECUTOR_SERVICE;

const formSchema = z.object({
  progLang: z.string(),
  codeToExecute: z.string(),
});

export default function Home() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      progLang: playgroundDefaultCode["python"].name,
      codeToExecute: playgroundDefaultCode["python"].codeToExecute,
    },
  });
  const [codeResult, setCodeResult] = useState("");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // check if the programmig language is selected
    if (values.progLang === "") {
      return toast({
        title: "Error",
        description: "Please select a programming language",
        variant: "destructive",
      });
    }

    const submitData = new FormData();
    submitData.append(
      "progLang",
      playgroundDefaultCode[values.progLang].langCode
    );
    submitData.append("codeToExecute", values.codeToExecute);

    let response = null;
    try {
      response = await fetch(`${executorUrl}/playground/run`, {
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

    // some problems with the server
    if (result.code !== 1) {
      return toast({
        title: "Error",
        description: "Internal server error. Please try again later",
        variant: "destructive",
      });
    }

    const { code: executionCode, content } = result.data;

    setCodeResult(content);
    if (executionCode === 1) {
      // code executed successfully
      return toast({
        title: "Success",
        description: "Code executed successfully",
        variant: "default",
      });
    } else {
      return toast({
        title: "Error",
        description: "Code execution failed. Please check your code",
        variant: "destructive",
      });
    }
  }

  function handleEditorWillMount(monaco: Monaco) {
    monaco.editor.defineTheme("lightTheme", editorLightTheme);
  }

  return (
    <div className="h-[93vh] max-w-5xl mx-auto grid grid-rows-8 gap-4 text-sm">
      {/* introduction sectoin */}
      <div className="row-span-1  flex-col flex-center mt-6">
        <h1 className="text-[16px] font-bold">Mini Code Runner</h1>
        <p>Execute code in any language you like</p>
      </div>
      {/* form */}
      <div className="row-span-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            {/* button set */}
            <div className="flex-between pb-4">
              <FormField
                control={form.control}
                name="progLang"
                render={({ field }) => (
                  <FormItem className="w-[240px]">
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);

                        form.setValue(
                          "codeToExecute",
                          playgroundDefaultCode[value].codeToExecute
                        );
                        setCodeResult("");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
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
                <FormItem className="border-2 w-full flex-1">
                  <FormControl>
                    <Editor
                      theme="lightTheme"
                      options={{
                        minimap: { enabled: false },
                        renderLineHighlight: "line",
                      }}
                      language={form.getValues("progLang")}
                      defaultLanguage={form.getValues("progLang")}
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
      </div>
      {/* execution result */}
      <div className="flex flex-col w-full row-span-2">
        <h2 className="text-14-medium pb-2">Result</h2>
        <Textarea
          className="resize-none border-2 border-gray-300 flex-1 rounded-none"
          disabled
          value={codeResult}
        />
      </div>
    </div>
  );
}
