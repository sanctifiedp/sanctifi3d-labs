export function readingTime(html: string): string {
  const text = html?.replace(/<[^>]+>/g, "") || "";
  const words = text.trim().split(/\s+/).length;
  const mins = Math.ceil(words / 200);
  return mins < 1 ? "< 1 min read" : `${mins} min read`;
}
