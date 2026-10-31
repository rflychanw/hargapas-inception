<!-- src/lib/components/SelectInput.svelte -->
<script lang="ts">
	import { fade } from 'svelte/transition';
	import { ChevronDown, Check } from '@lucide/svelte';

	interface Option {
		value: number | string;
		label: string;
	}

	let {
		id,
		name,
		label = '',
		disabled = false,
		value = $bindable(),
		options = []
	}: {
		id: string;
		name: string;
		label?: string;
		disabled?: boolean;
		value: number | string;
		options: Option[];
	} = $props();

	let isOpen = $state(false);
	let buttonRef = $state<HTMLButtonElement | null>(null);

	// Simpan posisi koordinat relatif terhadap Viewport
	let dropdownPos = $state({ top: 0, left: 0, width: 0 });

	let selectedOption = $derived(
		options.find((opt) => String(opt.value) === String(value)) ?? options[0]
	);

	function updatePosition() {
		if (buttonRef) {
			const rect = buttonRef.getBoundingClientRect();
			dropdownPos = {
				top: rect.bottom + 4,
				left: rect.left,
				width: rect.width
			};
		}
	}

	function toggleDropdown() {
		if (disabled) return;
		if (!isOpen) {
			updatePosition();
		}
		isOpen = !isOpen;
	}

	function selectOption(optValue: number | string) {
		if (disabled) return;
		value = optValue;
		isOpen = false;
	}

	function clickOutside(node: HTMLElement) {
		const handleOutsideClick = (event: MouseEvent) => {
			if (
				isOpen &&
				!node.contains(event.target as Node) &&
				!buttonRef?.contains(event.target as Node)
			) {
				isOpen = false;
			}
		};

		const handleScroll = () => {
			if (isOpen) {
				updatePosition();
			}
		};

		document.addEventListener('click', handleOutsideClick, true);
		window.addEventListener('scroll', handleScroll, true);
		window.addEventListener('resize', updatePosition);

		return {
			destroy() {
				document.removeEventListener('click', handleOutsideClick, true);
				window.removeEventListener('scroll', handleScroll, true);
				window.removeEventListener('resize', updatePosition);
			}
		};
	}
</script>

<div class="relative w-full">
	<input type="hidden" {id} {name} {value} />

	{#if label}
		<label for={id} class="mb-1 block text-xs font-semibold text-slate-700">
			{label}
		</label>
	{/if}

	<button
		type="button"
		bind:this={buttonRef}
		onclick={toggleDropdown}
		{disabled}
		class="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 transition-all hover:bg-slate-50/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 disabled:hover:bg-slate-100 {isOpen
			? 'border-orange-500 ring-2 ring-orange-500/20'
			: ''}"
	>
		<span class="truncate">{selectedOption?.label ?? 'Pilih...'}</span>
		<ChevronDown
			class="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 {isOpen
				? 'rotate-180 text-orange-600'
				: ''}"
		/>
	</button>

	{#if isOpen && !disabled}
		<div
			use:clickOutside
			transition:fade={{ duration: 100 }}
			style="position: fixed; top: {dropdownPos.top}px; left: {dropdownPos.left}px; width: {dropdownPos.width}px; z-index: 9999;"
			class="max-h-52 overflow-y-auto rounded-xl border border-slate-200/80 bg-white p-1 shadow-2xl shadow-slate-900/15 focus:outline-none"
		>
			{#each options as option (option.value)}
				{@const isSelected = String(option.value) === String(value)}
				<button
					type="button"
					onclick={() => selectOption(option.value)}
					class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all {isSelected
						? 'bg-orange-50 text-orange-700'
						: 'text-slate-700 hover:bg-slate-50'}"
				>
					<span class="truncate">{option.label}</span>
					{#if isSelected}
						<span transition:fade={{ duration: 100 }}>
							<Check class="h-3.5 w-3.5 text-orange-600" />
						</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

