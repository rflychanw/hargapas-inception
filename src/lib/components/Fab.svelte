<script lang="ts">
    import type { Component } from "svelte";
    import { Plus } from "@lucide/svelte";

    interface Props {
        href: string;
        label: string;
        icon?: Component<{ class?: string }>;
        class?: string;
    }

    let {
        href,
        label,
        icon: Icon = Plus,
        class: customClass = "",
    }: Props = $props();
</script>

<a
    {href}
    aria-label={label}
    title={label}
    class="fixed right-5 bottom-20 z-40 flex items-center justify-center rounded-full bg-orange-600 p-3.5 text-white shadow-lg shadow-orange-600/30 transition-all hover:bg-orange-700 active:scale-90 sm:hidden {customClass}"
>
    <Icon class="h-5 w-5" />
</a>
