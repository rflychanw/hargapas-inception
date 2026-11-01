<!-- src/lib/components/dashboard/TextInput.svelte -->
<script lang="ts">
    let {
        id,
        name,
        label,
        placeholder = "",
        required = false,
        disabled = false,
        value = $bindable(""),
    }: {
        id: string;
        name: string;
        label: string;
        placeholder?: string;
        required?: boolean;
        disabled?: boolean;
        value: string;
    } = $props();
</script>

<div>
    <label for={id} class="mb-1.5 block text-xs font-bold text-slate-700">
        {label}
    </label>
    <input
        type="text"
        {id}
        {name}
        {required}
        {placeholder}
        {disabled}
        bind:value
        class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 disabled:placeholder:text-slate-300"
    />
</div>
