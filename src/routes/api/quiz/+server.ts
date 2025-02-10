import OpenAI from "openai"
import { json, type RequestHandler } from "@sveltejs/kit"
import { GEMINI_API_KEY } from "$env/static/private"
import { PUBLIC_GEMINI_BASE_URL } from "$env/static/public"
import { removeSpaces } from "$lib/utils"
import { QUIZ_INSTRUCTIONS } from "$lib/constants"
import type { QuizRequest, ChatResponse } from "$lib/types"

const openai = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: PUBLIC_GEMINI_BASE_URL,
})

const createQuizPrompt = (message: string, lessons: string): string => {
  const cleanedMessage = removeSpaces(message)
  const cleanedLessons = removeSpaces(lessons)

  const formattedLessons = cleanedLessons
    ? `// Lessons Context\n${cleanedLessons}\n// End of Lessons Context\n\n`
    : ""

  const contextHistory = `// beginning of quiz\n${cleanedMessage}\n// end of quiz`

  return `${formattedLessons}${QUIZ_INSTRUCTIONS}\n${contextHistory}`
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { quizMessage, lessonMessages }: QuizRequest = await request.json()

    const prompt = createQuizPrompt(quizMessage, lessonMessages)

    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: QUIZ_INSTRUCTIONS,
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
