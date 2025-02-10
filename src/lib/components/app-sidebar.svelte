<script lang="ts" module>
	import { selectedTitle, activeMenuItem } from "$lib/stores"

	const data = {
		versions: ["French"],
		navMain: [
			{
				title: "My Learnings",
				url: "#",
				items: [
					{
						title: "New Session",
						url: "/",
					},
					{
						title: "Quizzes",
						url: "/quizzes",
					},
				],
			},
		],
	};
</script>

<script lang="ts">
	import VersionSwitcher from "$lib/components/version-switcher.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<VersionSwitcher versions={data.versions} defaultVersion={data.versions[0]} />
	</Sidebar.Header>
	<Sidebar.Content>
		<!-- We create a Sidebar.Group for each parent. -->
		{#each data.navMain as group (group.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={$activeMenuItem === item.title} onclick={() => {
								selectedTitle.set(item.title)
								activeMenuItem.set(item.title)
								}}>
									{#snippet child({ props })}
										<a href={item.url} {...props}>{item.title}</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
