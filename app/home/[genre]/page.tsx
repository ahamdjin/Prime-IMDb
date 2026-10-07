import { notFound, redirect } from "next/navigation";

export default async function CategoryRedirect({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  if (genre === "movies") redirect("/browse?type=movie");
  if (genre === "tvshows") redirect("/browse?type=tv");
  if (genre === "recently") redirect("/browse?sort=popular");
  notFound();
}
