<script lang="ts">
  import { writable } from "svelte/store"
  import { onMount } from "svelte"
  import { marked } from "marked"
  import { Textarea } from "$components/ui/textarea"
  import { Button } from "$components/ui/button"
  import { messages } from "$lib/stores"
  import { removeHTMLTags } from "$lib/utils"

  const userInput = writable("")
  const isSending = writable(false)
  const isAIGenerating = writable(false)
  let chatContainer = $state<HTMLDivElement | null>(null)

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }

  function startNewSession() {
    messages.set([])
    userInput.set("")

    isSending.set(false)
    isAIGenerating.set(false)
  }

  async function sendMessage() {
    const text = $userInput.trim()
    if (!text) return

    isSending.set(true)
    messages.update((msgs) => [...msgs, { sender: "me", text }])
    userInput.set("")

    await generateAIResponse(text)
    isSending.set(false)
  }

  async function fetchAIResponse(text: string) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.content
      } else {
        console.log("Failed to fetch AI response")
        return null
      }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async function displayAIResponse(aiResponse: string) {
    if (!aiResponse) {
      messages.update((msgs) => [
        ...msgs,
        { sender: "ai", text: "Sorry, I couldn't process your request. Please try again later." },
      ])
      return
    }

    const formattedResponse = await marked.parse(aiResponse)

    messages.update((msgs) => [...msgs, { sender: "ai", text: formattedResponse }])
    isAIGenerating.set(false)
  }

  async function generateAIResponse(text: string) {
    isAIGenerating.set(true)

    let conversationHistory = ""
    $messages.forEach((msg) => {
      conversationHistory += `${msg.sender === "me" ? "User: " : "AI: "} ${msg.text}\n`
    })

    // Add the current message to the conversation history
    conversationHistory += `User: ${text}\n`
    const formattedConversationHistory = removeHTMLTags(conversationHistory)

    const aiResponse = await fetchAIResponse(formattedConversationHistory)
    displayAIResponse(aiResponse)
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      sendMessage()
      event.preventDefault()
    }
  }

  onMount(() => {
    scrollToBottom()
  })

  $effect(() => {
    setTimeout(scrollToBottom, 100)
  })
</script>

<div
  class="flex-1 overflow-y-auto rounded-lg p-4"
  bind:this={chatContainer}
  style="max-height: 80vh;"
>
  {#each $messages as message}
    <div
      class="my-2 flex w-fit items-start gap-2 rounded-lg p-2"
      class:ai={message.sender === "ai"}
      class:me={message.sender === "me"}
    >
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

<div class="sticky bottom-0 flex items-end gap-2 bg-white p-4">
  <Textarea
    bind:value={$userInput}
    class="flex-1 rounded-lg border p-2"
    placeholder="Type to begin your class..."
    onkeydown={handleKeydown}
  />
  <div class="flex gap-2">
    <Button variant="default" onclick={sendMessage} disabled={$isSending || $isAIGenerating}>
      Send
    </Button>
    <Button variant="outline" onclick={startNewSession} disabled={$isSending || $isAIGenerating}>
      Start new session
    </Button>
  </div>
</div>

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
