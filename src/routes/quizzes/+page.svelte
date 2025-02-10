<script lang="ts">
  import { writable, get } from "svelte/store";
  import { onMount } from "svelte";
  import { marked } from "marked";
  import { Textarea } from "$components/ui/textarea"
  import { Button } from "$components/ui/button"
  import { messages } from "$lib/stores"
  import { removeHTMLTags } from "$lib/utils"
  import { Card, CardFooter } from "$components/ui/card"
  import { CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card/index.js"

  const userInput = writable("");
  const isSending = writable(false);
  const isAIGenerating = writable(false);
  const isQuizStarted = writable(false);
  const quizMessages = writable<{ sender: "me" | "ai"; text: string }[]>([])
  let chatContainer = $state<HTMLDivElement | null>(null);

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  async function sendMessage() {
    const text = $userInput.trim();
    if (!text) return;

    isSending.set(true);
    quizMessages.update((msgs) => [...msgs, { sender: "me", text }]);
    userInput.set("");

    const lessonMessages = get(messages)
      .map(msg => `${msg.sender === "me" ? "User:" : "AI:"} ${msg.text}`)
      .join("\n")

    await generateAIResponse(text, lessonMessages);
    isSending.set(false);
  }

  function startQuiz() {
    isQuizStarted.set(true);

    const initialPrompt = "Let's begin the quiz!"

    const lessonMessages = get(messages)
      .map(msg => `${msg.sender === "me" ? "User:" : "AI:"} ${msg.text}`)
      .join("\n");

    generateAIResponse(initialPrompt, lessonMessages);
  }

  function stopQuiz() {
    isQuizStarted.set(false);
    quizMessages.set([])
  }

  async function fetchAIResponse(text: string, lessons: string) {
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizMessage: text, lessonMessages: lessons }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.content;
      } else {
        console.log("Failed to fetch AI response");
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function displayAIResponse(aiResponse: string) {
    if (!aiResponse) {
      quizMessages.update((msgs) => [
        ...msgs,
        { sender: "ai", text: "Sorry, I couldn't process your request. Please try again later." },
      ]);
      return;
    }

    const formattedResponse = await marked.parse(aiResponse);
    quizMessages.update((msgs) => [...msgs, { sender: "ai", text: formattedResponse }]);
    isAIGenerating.set(false);
  }

  async function generateAIResponse(text: string, lessons: string) {
    isAIGenerating.set(true);

    let conversationHistory = '';
    $quizMessages.forEach(msg => {
      conversationHistory += `${msg.sender === 'me' ? 'User: ' : 'AI: '} ${msg.text}\n`;
    });

    conversationHistory += `User: ${text}\n`;
    const formattedConversationHistory = removeHTMLTags(conversationHistory)
    const formattedLessons = removeHTMLTags(lessons)

    const aiResponse = await fetchAIResponse(formattedConversationHistory, formattedLessons);
    displayAIResponse(aiResponse);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      sendMessage();
      event.preventDefault();
    }
  }

  onMount(() => {
    scrollToBottom();
  });

  $effect(() => {
    setTimeout(scrollToBottom, 100);
  });
</script>

{#if $isQuizStarted}
  <div
    class="flex-1 overflow-y-auto p-4 rounded-lg"
    bind:this={chatContainer}
    style="max-height: 80vh;"
  >
    {#each $quizMessages as message}
      <div class="flex items-start gap-2 p-2 my-2 rounded-lg w-fit" class:ai={message.sender === "ai"} class:me={message.sender === "me"}>
        <div class="avatar" class:ai={message.sender === "ai"} class:me={message.sender === "me"}>
          {message.sender === "ai" ? "🤖" : "🙋"}
        </div>
        <div class="message" class:ai={message.sender === "ai"} class:me={message.sender === "me"}>
          {#if message.sender === "ai"}
            <div class="markdown" bind:this={chatContainer}>
              {@html message.text}
            </div>
          {:else}
            <div class="message-text">{message.text}</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <div class="sticky bottom-0 bg-white p-4 flex gap-2 items-end">
      <Textarea
        bind:value={$userInput}
        class="flex-1 p-2 border rounded-lg"
        placeholder="Type a message..."
        onkeydown={handleKeydown}
      />
      <div class="flex gap-2">
        <Button variant="default" onclick={sendMessage} disabled={$isSending || $isAIGenerating}>
          Send
        </Button>
        <Button variant="destructive" onclick={stopQuiz} disabled={$isSending || $isAIGenerating}>
          Finish Quiz
        </Button>
      </div>
  </div>
  {:else}
  <div class="flex justify-center items-center mt-40">
    <Card class="w-[500px] flex flex-col items-center text-center p-6">
      <CardHeader>
        <CardTitle>Begin your practice</CardTitle>
        <CardDescription>Here you can practice what you have learnt so far</CardDescription>
      </CardHeader>
      <CardContent class="w-full">
        <div class="w-full p-4 bg-gray-100 rounded-lg text-lg font-semibold">
          Click below to start the quiz
        </div>
      </CardContent>
      <CardFooter class=" w-full flex justify-center mt-4">
        <Button onclick={startQuiz}>Start Quiz</Button>
      </CardFooter>
    </Card>
  </div>
{/if}

<style>
    .message {
        padding: 10px;
        border-radius: 10px;
        position: relative;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }

    .me .message {
        max-width: 100%;
        background-color: #f4e0c9;
        color: black;
        align-self: flex-end;
    }

    .ai .message {
        max-width: 80%;
        background-color: #f1f1f1;
        color: black;
        align-self: flex-start;
    }

    .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .me .avatar {
        background-color: #007bff;
        color: white;
        align-self: flex-end;
    }

    .ai .avatar {
        background-color: #ddd;
        color: black;
        align-self: flex-start;
    }

    .me,
    .ai {
        margin-bottom: 20px;
    }
</style>
