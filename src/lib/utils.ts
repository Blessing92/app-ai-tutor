import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeSpaces(str: string): string {
  return str.replace(/\s+/g, " ").trim()
}

export function removeHTMLTags(str: string): string {
  const doc = new DOMParser().parseFromString(str, "text/html")
  return doc.body.textContent || ""
}

export function formatAIResponse(text: string): string {
  // Convert **bold** to <strong>bold</strong>
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Convert *italic* to <em>italic</em>
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>")

  // Convert numbered lists (1. Item) to <ol> lists
  text = text.replace(/(\d+)\.\s(.+)/g, "<li>$2</li>")
  text = text.replace(/(<li>.+<\/li>)+/g, "<ol>$&</ol>")

  // Convert bullet lists (* Item) to <ul> lists
  text = text.replace(/\*\s(.+)/g, "<li>$1</li>")
  text = text.replace(/(<li>.+<\/li>)+/g, "<ul>$&</ul>")

  // Preserve new lines as <br>
  text = text.replace(/\n/g, "<br>")

  return text
}
