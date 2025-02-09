<script lang="ts">
  import '../app.css';
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index";
  import { Separator } from "$lib/components/ui/separator/index";
  import { selectedTitle } from "$lib/stores";
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <!-- Header -->
    <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <Sidebar.Trigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item class="hidden md:block">
            <Breadcrumb.Link href="/">My Learnings</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator class="hidden md:block" />
          <Breadcrumb.Item>
            <Breadcrumb.Page>{$selectedTitle}</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </header>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col gap-4 p-4">
      <slot /> <!-- This will render the content of child pages -->
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
