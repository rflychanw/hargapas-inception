<script lang="ts">
	import { initialMenuItems } from '#lib/dashboard-data.js';
	import Sidebar from '#lib/components/dashboard/Sidebar.svelte';
	import OverviewView from '#lib/components/dashboard/OverviewView.svelte';
	import MenuDetailView from '#lib/components/dashboard/MenuDetailView.svelte';
	import AiConsultantView from '#lib/components/dashboard/AiConsultantView.svelte';
	import CalculatorView from '#lib/components/dashboard/CalculatorView.svelte';
	import HppModal, { type MenuItem } from '#lib/components/dashboard/HppModal.svelte';

	let activeTab = $state('ringkasan');
	let menuItems = $state<MenuItem[]>(initialMenuItems);
	let activeModalItem = $state<MenuItem | null>(null);
	let aiQueryPrompt = $state('');

	function handleOpenModal(item: MenuItem) {
		activeModalItem = item;
	}

	function handleCloseModal() {
		activeModalItem = null;
	}

	function handleSaveItem(updated: MenuItem) {
		menuItems = menuItems.map((item) => (item.id === updated.id ? updated : item));
		activeModalItem = null;
	}

	function handleAskAi(prompt: string) {
		aiQueryPrompt = prompt;
		activeTab = 'ai';
	}

	function handleAddMenu(newItem: MenuItem) {
		menuItems = [newItem, ...menuItems];
		activeTab = 'menu';
	}

	function handleApplyRecommendation(menuId: string, newPrice: number) {
		menuItems = menuItems.map((item) =>
			item.id === menuId ? { ...item, price: newPrice } : item
		);
		activeTab = 'ringkasan';
	}
</script>

<svelte:head>
	<title>Dashboard Warung Bu Sirep — HargaPas</title>
	<meta
		name="description"
		content="Dashboard kalkulasi HPP, margin tiap piring, dan rekomendasi konsultan AI untuk Warung Bu Sirep."
	/>
</svelte:head>

<div class="dash-layout">
	<!-- Sidebar (Desktop & Mobile Bottom Nav) -->
	<Sidebar {activeTab} onselect={(tab: string) => (activeTab = tab)} />

	<!-- Main Canvas -->
	<main class="dash-main" id="main-content">
		{#if activeTab === 'ringkasan'}
			<OverviewView
				items={menuItems}
				onopenmodal={handleOpenModal}
				onaskai={handleAskAi}
				oncreatemenu={() => (activeTab = 'kalkulator')}
			/>
		{:else if activeTab === 'menu'}
			<MenuDetailView
				items={menuItems}
				onopenmodal={handleOpenModal}
				onaskai={handleAskAi}
				oncreatemenu={() => (activeTab = 'kalkulator')}
			/>
		{:else if activeTab === 'ai'}
			<AiConsultantView
				items={menuItems}
				initialPrompt={aiQueryPrompt}
				onapplyrecommendation={handleApplyRecommendation}
			/>
		{:else if activeTab === 'kalkulator'}
			<CalculatorView onaddmenu={handleAddMenu} />
		{/if}
	</main>

	<!-- Modal Rincian 5 Komponen HPP -->
	{#if activeModalItem}
		<HppModal
			item={activeModalItem}
			onclose={handleCloseModal}
			onsave={handleSaveItem}
		/>
	{/if}
</div>
