export interface ChatResponse {
  content: string
}

export interface ChatRequest {
  message: string
}

export interface QuizRequest {
  quizMessage: string
  lessonMessages: string
}
