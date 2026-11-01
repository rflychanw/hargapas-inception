// src/routes/[storeId]/menu/[id]/edit/+page.server.ts
import type { PageServerLoad, Actions } from "./$types";
import { getIngredients } from "#lib/server/services/ingredients.ts";
import { getMenuItemById, updateMenuItem } from "#lib/server/services/menu.ts";
import { error, fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const storeId = params.storeId;
  const menuId = params.id;

  // Eksekusi pengambilan data secara paralel tanpa await di root
  // UI halaman edit akan langsung terbuka instan (0 ms latency)
  const menuItemPromise = getMenuItemById(menuId, storeId).then((menuItem) => {
    if (!menuItem) {
      error(404, "Menu tidak ditemukan");
    }
    return menuItem;
  });

  const ingredientsPromise = getIngredients(storeId).catch((err) => {
    console.error("Gagal mengambil daftar bahan baku:", err);
    return [];
  });

  return {
    menuItem: menuItemPromise,
    ingredients: ingredientsPromise,
  };
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    const storeId = params.storeId?.trim();
    const formData = await request.formData();

    const id = (formData.get("id") as string)?.trim();
    const name = (formData.get("name") as string)?.trim();
    const sellingPriceInput = formData.get("sellingPrice") as string;
    const sellingPrice = parseFloat(sellingPriceInput);
    const category = (formData.get("category") as string)?.trim() || "General";
    const ingredientsJson = formData.get("ingredientsJson") as string;

    if (!storeId || !id) {
      return fail(400, { message: "ID Toko atau ID Menu tidak valid" });
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
      await updateMenuItem(id, storeId, {
        name,
        sellingPrice,
        category,
        ingredients,
      });
    } catch (err: any) {
      console.error("Gagal memperbarui menu:", err);
      return fail(500, {
        message: err?.message || "Gagal memperbarui menu di database.",
      });
    }

    // Redirect 303 berada di luar try-catch agar navigasi berjalan mulus
    redirect(303, `/stores/${storeId}/menu`);
  },
};
