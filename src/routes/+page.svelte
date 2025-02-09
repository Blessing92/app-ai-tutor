<script lang="ts">
  import { writable } from "svelte/store";
  import { onMount } from "svelte";
  import { marked } from "marked";
  import { Textarea } from "$components/ui/textarea"
  import { Button } from "$components/ui/button"
  import { Skeleton } from "$components/ui/skeleton"

  const messages = writable<{ sender: "me" | "ai"; text: string }[]>([]);
  const userInput = writable("");
  const isSending = writable(false);
  const isAIGenerating = writable(false);
  let chatContainer: HTMLDivElement | null = null;

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  async function sendMessage() {
    const text = $userInput.trim();
    if (!text) return;

    isSending.set(true);
    messages.update((msgs) => [...msgs, { sender: "me", text }]);

    userInput.set("");

    await generateAIResponse(text);
    setTimeout(scrollToBottom, 100);
    isSending.set(false);
  }

  async function fetchAIResponse(text: string) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
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

  function removeHTMLTags(str: string): string {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.body.textContent || "";
  }

  async function displayAIResponse(aiResponse: string) {
    if (!aiResponse) {
      messages.update((msgs) => [
        ...msgs,
        { sender: "ai", text: "Sorry, I couldn't process your request. Please try again later." },
      ]);
      return;
    }

    const formattedResponse = await marked.parse(aiResponse);
    messages.update((msgs) => [...msgs, { sender: "ai", text: formattedResponse }]);

    setTimeout(scrollToBottom, 100);
    isAIGenerating.set(false);
  }

  async function generateAIResponse(text: string) {
    isAIGenerating.set(true);

    let conversationHistory = '';
    $messages.forEach(msg => {
      conversationHistory += `${msg.sender === 'me' ? 'User: ' : 'AI: '} ${msg.text}\n`;
    });

    // Add the current message to the conversation history
    conversationHistory += `User: ${text}\n`;
    const formattedConversationHistory = removeHTMLTags(conversationHistory)

    const aiResponse = await fetchAIResponse(formattedConversationHistory);
    displayAIResponse(aiResponse);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      sendMessage();
      event.preventDefault();
    }
  }

  onMount(scrollToBottom);
</script>


<div
  class="flex-1 overflow-y-auto p-4 rounded-lg"
  bind:this={chatContainer}
  style="max-height: 80vh;"
>
  {#each $messages as message}
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

<div class="sticky bottom-0 bg-white p-4 flex gap-2">
  {#if $isAIGenerating}
    <div class="absolute top-[-30px] left-0 right-0 flex justify-center">
      <Skeleton class="h-[20px] w-[100%]" />
    </div>
  {/if}

  <Textarea
    bind:value={$userInput}
    class="flex-1 p-2 border rounded-lg"
    placeholder="Type a message..."
    onkeydown={handleKeydown}
  />
  <Button variant="default" onclick={sendMessage} disabled={$isSending || $isAIGenerating}>
    Send
  </Button>
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
