import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  cookies().delete("jwt");
  redirect("http://localhost:3000");
}
