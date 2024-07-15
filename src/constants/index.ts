export const playgroundDefaultCode: {
  [key: string]: { [key: string]: string };
} = {
  java: {
    name: "java",
    langCode: "JAVA",
    codeToExecute: `class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!"); \n    }\n}`,
  },
  python: {
    name: "python",
    langCode: "PYTHON",
    codeToExecute: `print("Hello, Python!")`,
  },
};
