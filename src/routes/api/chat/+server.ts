import { json, type RequestHandler } from "@sveltejs/kit"
import { GEMINI_API_KEY } from "$env/static/private"
import { PUBLIC_GEMINI_BASE_URL } from "$env/static/public"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: PUBLIC_GEMINI_BASE_URL,
})

interface ChatResponse {
  content: string
}

interface ChatRequest {
  message: string
}

const SYSTEM_INSTRUCTIONS =
  " You are an expert French language tutor. Teach the student in an interactive way. " +
  "Respond with less content to help the student learn better, each response should contain " +
  " a numbered list, and under each header," +
  "provide a bullet-point list of key items or explanations. The headers should follow the " +
  "format: 1. Something, 2. Something else, etc." +
  "Make the content educational, engaging, and fun to encourage learning."

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message }: ChatRequest = await request.json()

    const response = await openai.chat.completions.create({
      model: "gemini-1.5-flash",
      messages: [
        {
          role: "system",
          content: SYSTEM_INSTRUCTIONS,
        },
        { role: "user", content: message },
      ],
    })

    const content = response.choices[0]?.message?.content ?? "No content available"
    const chatResponse: ChatResponse = {
      content: content,
    }

    return json(chatResponse)
  } catch (error) {
    console.log("Error communicating with OpenAI:", error)
    return json({ error: "Something went wrong. Please try again later." }, { status: 500 })
  }
}
