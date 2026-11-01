<!-- src/lib/components/dashboard/NumberInput.svelte -->
<script lang="ts">
    let {
        id,
        name,
        label,
        placeholder = "",
        required = false,
        disabled = false,
        min,
        step,
        value = $bindable(),
    }: {
        id: string;
        name: string;
        label: string;
        placeholder?: string;
        required?: boolean;
        disabled?: boolean;
        min?: number | string;
        step?: number | string;
        value: number | "";
    } = $props();
</script>

<div>
    <label for={id} class="mb-1.5 block text-xs font-bold text-slate-700">
        {label}
    </label>
    <input
        type="number"
        {id}
        {name}
        {required}
        {min}
        {step}
        {placeholder}
        {disabled}
        bind:value
        class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
    />
</div>
