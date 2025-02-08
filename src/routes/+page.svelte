<script lang="ts">
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index";
  import { Separator } from "$lib/components/ui/separator/index";
  import * as Sidebar from "$lib/components/ui/sidebar/index";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import { selectedTitle } from "$lib/stores";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { marked } from "marked"

  const messages = writable<{ sender: "me" | "ai"; text: string }[]>([]);

  const userInput = writable("");

  let chatContainer: HTMLDivElement | null = null;

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function sendMessage() {
    userInput.update((text) => {
      if (!text.trim()) return ""
      messages.update((msgs) => [...msgs, { sender: "me", text}]);
      generateAIResponse(text);
      return "";
    })
    // Auto-scroll after sending
    setTimeout(scrollToBottom, 100);
  }

  async function fetchAIResponse(text: string) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  async function displayAIResponse(aiResponse: string) {
    if (!aiResponse) {
      messages.update((msgs) => [...msgs, { sender: "ai", text: "Sorry, I couldn't process your request. Please try again later." }]);
      return;
    }

    const formattedResponse = await marked(aiResponse)
    messages.update((msgs) => [...msgs, { sender: "ai", text: formattedResponse }]);
    scrollToBottom()

    // Type effect
    // let index = 0;
    // const interval = setInterval(() => {
    //   if (index < aiResponse.length) {
    //     displayedText += aiResponse[index++];
    //     messages.update((msgs) => {
    //       const last = msgs[msgs.length - 1];
    //       last.text = displayedText;
    //       return [...msgs.slice(0, -1), last];
    //     });
    //     scrollToBottom();
    //   } else {
    //     clearInterval(interval);
    //   }
    // }, 50);
  }

  async function generateAIResponse(text: string) {
    const aiResponse = await fetchAIResponse(text);
    displayAIResponse(aiResponse);
  }

  onMount(scrollToBottom);
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <Sidebar.Trigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item class="hidden md:block">
            <Breadcrumb.Link href="#">My Learnings</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator class="hidden md:block" />
          <Breadcrumb.Item>
            <Breadcrumb.Page>{$selectedTitle}</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </header>

    <div class="flex flex-1 flex-col gap-4 p-4">
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
<!--            <div class="message">{message.text}</div>-->
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

      <div class="sticky bottom-0 bg-white p-4 flex gap-2 border-t">
        <input
          type="text"
          bind:value={$userInput}
          class="flex-1 p-2 border rounded-lg"
          placeholder="Type a message..."
          on:keydown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button class="px-4 py-2 bg-blue-500 text-white rounded-lg" on:click={sendMessage}>Send</button>
      </div>
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>

<style>
    .message {
        max-width: 80%;
        padding: 10px;
        border-radius: 10px;
        position: relative;
    }

    .me {
        align-self: flex-end;
        background-color: #f4e0c9;
        color: black;
    }

    .ai {
        align-self: flex-start;
        background-color: #f1f1f1;
        color: black;
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

    .me, .ai {
        margin-bottom: 20px;
    }
</style>
