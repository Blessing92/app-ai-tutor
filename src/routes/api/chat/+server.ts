import OpenAI from "openai"
import { json, type RequestHandler } from "@sveltejs/kit"
import { GEMINI_API_KEY } from "$env/static/private"
import { PUBLIC_GEMINI_BASE_URL } from "$env/static/public"
import { removeSpaces } from "$lib/utils"
import { SYSTEM_INSTRUCTIONS } from "$lib/constants"
import type { ChatRequest, ChatResponse } from "$lib/types"

const openai = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: PUBLIC_GEMINI_BASE_URL,
})

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message }: ChatRequest = await request.json()

    const cleanedMessage = removeSpaces(message)
    const contextHistory = `// beginning of history\n${cleanedMessage}\n// end of history`

    const prompt = `${SYSTEM_INSTRUCTIONS}\n${contextHistory}`

    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: SYSTEM_INSTRUCTIONS,
        },
        { role: "user", content: prompt },
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
