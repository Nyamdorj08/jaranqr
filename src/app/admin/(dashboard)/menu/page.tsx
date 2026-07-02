import { getMenu } from "@/lib/data";
import { createCategory, createMenuItem, deleteCategory } from "@/lib/actions/menu";
import { MenuItemRow } from "@/components/admin/menu-item-row";

export default async function AdminMenuPage() {
  const categories = await getMenu({ onlyAvailable: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-brand-secondary">Меню удирдах</h1>

      <form
        action={createCategory}
        className="flex flex-wrap items-end gap-2 rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <div>
          <label className="text-xs font-medium text-neutral-700">Шинэ ангилалын нэр</label>
          <input
            name="name"
            required
            placeholder="жишээ: Үндсэн хоол"
            className="mt-1 block rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-700">Эрэмбэ</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={categories.length + 1}
            className="mt-1 block w-20 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-gray-900"
          />
        </div>
        <button className="rounded-lg bg-brand-primary px-4 py-1.5 text-sm font-medium text-white">
          Ангилал нэмэх
        </button>
      </form>

      {categories.map((category) => (
        <div key={category.id} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{category.name}</h2>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category.id} />
              <button className="text-xs font-medium text-red-600">Ангилал устгах</button>
            </form>
          </div>

          <div className="space-y-2">
            {category.items.map((item) => (
              <MenuItemRow key={item.id} item={item} />
            ))}
            {category.items.length === 0 && (
              <p className="text-sm text-neutral-600">Одоогоор хоол алга байна.</p>
            )}
          </div>

          <form
            action={createMenuItem}
            className="grid grid-cols-2 gap-2 rounded-xl border border-dashed border-neutral-300 p-3 md:grid-cols-4"
          >
            <input type="hidden" name="category_id" value={category.id} />
            <input
              name="name"
              required
              placeholder="Хоолны нэр"
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-gray-900 md:col-span-1"
            />
            <input
              name="price"
              type="number"
              required
              step="1"
              placeholder="Үнэ"
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-gray-900"
            />
            <input
              name="description"
              placeholder="Тайлбар"
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-gray-900 md:col-span-2"
            />
            <input
              name="image_url"
              placeholder="Зургийн URL (заавал биш)"
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-gray-900 md:col-span-2"
            />
            <input
              name="tags"
              placeholder="Шошго: new, popular, spicy, vegan"
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-gray-900 md:col-span-2"
            />
            <button className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-medium text-white md:col-span-4">
              Хоол нэмэх
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
