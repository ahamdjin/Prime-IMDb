import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import GithubSignIn from "@/app/components/GithubSignIn";
import GoogleSIgnIn from "@/app/components/GoogleSIgnIn";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utlis/auth";
import { redirect } from "next/navigation";
import { hasAuth } from "@/app/utlis/runtime";

export default async function Login() {
  if (!hasAuth) {
    return (
      <div className="mt-24 rounded bg-black/80 px-6 py-10 text-white md:max-w-sm md:px-14">
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="mt-5 text-gray-300">Accounts are coming soon. You can browse movies and watch trailers without signing in.</p>
        <Link href="/home" className="mt-6 inline-block rounded bg-red-600 px-5 py-3 font-semibold hover:bg-red-700">Browse as guest</Link>
      </div>
    );
  }
  const session = await getServerSession(authOptions);
  if (session) return redirect("/home");
  return (
    <div className="mt-24 rounded bg-black/80 py-10 px-6 md:max-w-sm md:px-14">
      <form method="post" action="/api/auth/signin">
        <h1 className="text-3xl font-bold text-white">Login</h1>
        <div className="space-y-4 mt-5">
          <Input
            type="email"
            placeholder="Email"
            name="email"
            className="bg-[#333] placeholder:text-xs placeholder:text-gray-400 w-full inline-block"
          />
          <Button
            type="submit"
            variant={"destructive"}
            className="w-full bg-[#e50914]"
          >
            Login
          </Button>
        </div>
      </form>
      <div className="mt-5 ">
        <p className="mt-5 text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-white hover:underline">
            Sign up
          </Link>
        </p>
      </div>
      <div className="flex w-full justify-center items-center gap-x-3 mt-6">
        <GithubSignIn />
        <GoogleSIgnIn />
      </div>
    </div>
  );
}
