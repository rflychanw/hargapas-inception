<!-- src/lib/components/SidebarNav.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import { LayoutDashboard, UtensilsCrossed, Layers, Sparkles } from '@lucide/svelte';

	interface Props {
		currentStoreId: string;
		isCollapsed?: boolean;
		closeMobileMenu?: () => void;
		variant?: 'vertical' | 'horizontal';
	}

	let {
		currentStoreId,
		isCollapsed = false,
		closeMobileMenu = () => {},
		variant = 'vertical'
	}: Props = $props();

	const navItems = $derived([
		{
			href: `/${currentStoreId}/dashboard`,
			label: 'Dashboard',
			icon: LayoutDashboard,
			pattern: '/dashboard'
		},
		{
			href: `/${currentStoreId}/menu`,
			label: 'Menu',
			icon: UtensilsCrossed,
			pattern: '/menu'
		},
		{
			href: `/${currentStoreId}/ingredients`,
			label: 'Bahan',
			icon: Layers,
			pattern: '/ingredients'
		},
		{
			href: `/${currentStoreId}/advisor`,
			label: 'Konsultan',
			icon: Sparkles,
			pattern: '/advisor'
		}
	]);
</script>

{#if variant === 'horizontal'}
	<!-- Bottom Navigation khusus Mobile (Horizontal) -->
	<nav class="flex h-16 w-full items-center justify-around bg-white px-2 shadow-lg">
		{#each navItems as item (item.pattern)}
			{@const isActive = page.url.pathname.includes(item.pattern)}
			{@const Icon = item.icon}

			<a
				href={item.href}
				onclick={closeMobileMenu}
				class="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-bold transition-all {isActive
					? 'font-extrabold text-orange-600'
					: 'text-slate-500 hover:text-slate-800'}"
			>
				<div class="relative flex items-center justify-center">
					<Icon class="h-5 w-5 shrink-0" />
				</div>
				<span class="truncate">{item.label}</span>
			</a>
		{/each}
	</nav>
{:else}
	<!-- Vertical Sidebar (Desktop) -->
	<nav class="space-y-1.5">
		{#each navItems as item (item.pattern)}
			{@const isActive = page.url.pathname.includes(item.pattern)}
			{@const Icon = item.icon}

			<a
				href={item.href}
				onclick={closeMobileMenu}
				title={item.label}
				class="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-semibold transition-all {isActive
					? 'bg-orange-600 text-white shadow-xs'
					: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'} {isCollapsed
					? 'md:justify-center md:px-0'
					: ''}"
			>
				<Icon class="h-5 w-5 shrink-0" />
				<span class="truncate {isCollapsed ? 'md:hidden' : 'md:inline'}">
					{item.label}
				</span>
			</a>
		{/each}
	</nav>
{/if}

