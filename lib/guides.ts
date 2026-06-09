import fs from "fs";
import path from "path";
import matter from "gray-matter";

const guidesDir = path.join(process.cwd(), "content/guides");

export interface Guide {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  content: string;
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const filePath = path.join(guidesDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    publishDate: data.publishDate ?? "",
    content,
  };
}

export async function getAllGuides(): Promise<Guide[]> {
  const files = fs.readdirSync(guidesDir);
  const guides = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => getGuideBySlug(f.replace(".mdx", "")))
  );
  return guides.filter(Boolean) as Guide[];
}
