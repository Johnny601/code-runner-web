"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { playgroundDefaultCode } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor, EditorProps, Monaco, useMonaco } from "@monaco-editor/react";
import { log } from "console";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { editor } from "monaco-editor";
import { z } from "zod";
import { editorLightTheme } from "@/config/monacoTheme";
import { Separator } from "@/components/ui/separator";

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
  // const monaco = useMonaco();

  const [codeResult, setCodeResult] = useState("");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const submitData = new FormData();
    submitData.append(
      "progLang",
      playgroundDefaultCode[values.progLang].langCode
    );
    submitData.append("codeToExecute", values.codeToExecute);

    const res = await fetch("http://localhost:63010/executor/run/java", {
      method: "POST",
      body: submitData,
    });
    toast({
      title: "Error",
      description: "An error occurred while running the code",
      variant: "destructive",
    });

    if (!res.ok) {
      toast({
        title: "Error",
        description: "An error occurred while running the code",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Code executed successfully",
        variant: "default",
      });
      const result = await res.text();
      setCodeResult(result);
    }

    // setCodeResult(await res.json());
  }

  function handleEditorWillMount(monaco: Monaco) {
    monaco.editor.defineTheme("lightTheme", editorLightTheme);
    monaco.editor.setTheme("lightTheme");
  }

  // useEffect(() => {
  //   monaco?.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  //   if (monaco) {
  //     monaco.editor.defineTheme("lightTheme", editorLightTheme);
  //     monaco.editor.setTheme("lightTheme");
  //   }
  // }, [monaco]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col space-y-8 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
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
              <div className="space-x-3">
                <Button type="submit">Execute</Button>
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
                        renderLineHighlight: "all",
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
            onChange={(e) => setCodeResult(e.target.value)}
          />
        </div>
      </div>
    </main>
  );
}
