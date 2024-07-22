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

const formSchema = z.object({
  progLang: z.string(),
  codeToExecute: z.string(),
});

export default function Home() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      progLang: "",
      codeToExecute: "",
    },
  });
  const [codeResult, setCodeResult] = useState("");

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
    submitData.append(
      "progLang",
      playgroundDefaultCode[values.progLang].langCode
    );
    submitData.append("codeToExecute", values.codeToExecute);

    let response = null;
    try {
      response = await fetch("http://localhost:63010/executor/playground/run", {
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
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col space-y-6 w-full max-w-5xl items-center justify-between  text-sm lg:flex">
        {/* introduction sectoin */}
        <section className="flex-center flex-col">
          <h1 className="text-18-bold">Mini Code Runner</h1>
          <p>Execute code in any language you like</p>
        </section>
        {/* form */}
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
                <FormItem className="border-4">
                  <FormControl>
                    <Editor
                      theme="lightTheme"
                      options={{
                        minimap: { enabled: false },
                        renderLineHighlight: "line",
                      }}
                      height="40vh"
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
        <div className="w-full space-y-2">
          <h2 className="text-14-medium">Result</h2>
          <Textarea
            className="resize-none border-2 border-gray-400 h-[15vh]"
            disabled
            value={codeResult}
          />
        </div>
      </div>
    </div>
  );
}
