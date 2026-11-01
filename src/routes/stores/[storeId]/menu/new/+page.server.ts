// src/routes/[storeId]/menu/new/+page.server.ts
import type { PageServerLoad, Actions } from "./$types";
import { getIngredients } from "#lib/server/services/ingredients.ts";
import { createMenuItem } from "#lib/server/services/menu.ts";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const storeId = params.storeId;

  // Buka stream promise langsung tanpa await/parent()
  // UI form penambahan menu akan langsung terbuka instan (0 ms latency)
  const ingredientsPromise = getIngredients(storeId).catch((err) => {
    console.error("Gagal mengambil daftar bahan baku:", err);
    return [];
  });

  return {
    ingredients: ingredientsPromise,
  };
};

export const actions: Actions = {
  create: async ({ request, params }) => {
    const storeId = params.storeId?.trim();
    const formData = await request.formData();

    const name = (formData.get("name") as string)?.trim();
    const sellingPriceInput = formData.get("sellingPrice") as string;
    const sellingPrice = parseFloat(sellingPriceInput);
    const category = (formData.get("category") as string)?.trim() || "General";
    const ingredientsJson = formData.get("ingredientsJson") as string;

    if (!storeId) {
      return fail(400, { message: "ID Toko tidak valid" });
    }

    if (!name || isNaN(sellingPrice) || sellingPrice < 0) {
      return fail(400, { message: "Nama menu dan harga jual harus valid" });
    }

    let ingredients: Array<{ ingredientId: string; quantityUsed: number }> = [];

    try {
      if (ingredientsJson) {
        const parsed = JSON.parse(ingredientsJson);
        if (Array.isArray(parsed)) {
          ingredients = parsed
            .map((item) => ({
              ingredientId: String(item.ingredientId || "").trim(),
              quantityUsed: parseFloat(String(item.quantityUsed)) || 0,
            }))
            .filter((item) => item.ingredientId && item.quantityUsed > 0);
        }
      }
    } catch (err) {
      return fail(400, { message: "Format komposisi resep tidak valid" });
    }

    try {
      await createMenuItem(storeId, {
        name,
        sellingPrice,
        category,
        ingredients,
      });
    } catch (err: any) {
      console.error("Gagal membuat menu baru:", err);
      return fail(500, {
        message: err?.message || "Gagal membuat menu baru di database.",
      });
    }

    // Redirect 303 ditempatkan di luar try-catch agar tidak ditangkap sebagai error 500
    redirect(303, `/stores/${storeId}/menu`);
  },
};
