import { Button } from "@/components/ui/button";
import { prisma } from "../utlis/db";
import { catalog } from "../utlis/catalog";
import { hasDatabase } from "../utlis/runtime";
import { notFound } from "next/navigation";

export default function SeedDatabase() {
  async function postData() {
    "use server";
    if (!hasDatabase || process.env.NODE_ENV === "production") return;
    await prisma.movie.createMany({
      data: catalog,
    });
  }

  if (!hasDatabase || process.env.NODE_ENV === "production") notFound();

  return (
    <div className="m-5">
      <form action={postData}>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
