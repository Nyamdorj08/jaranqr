# Жаран — QR Menu + Sales Dashboard

Ресторанд зориулсан QR цэс (захиалга өгөх боломжтой) болон эзэмшигчид зориулсан
борлуулалтын dashboard. Next.js 16 (App Router) + Supabase (Postgres/Auth) + Tailwind CSS.

## Бүтэц

- `/menu` — Хэрэглэгчийн цэс. QR-аар нээгдэнэ, нэвтрэх шаардлагагүй. Ангилал,
  хайлт, сагс, захиалга илгээх боломжтой.
- `/admin/login` — Админ нэвтрэх.
- `/admin` — Хянах самбар: өнөөдөр/энэ сарын орлого, өсөлт/бууралт хувь,
  сүүлийн 30 хоногийн график, топ 5 хоол.
- `/admin/menu` — Ангилал/хоол нэмэх, засах, устгах, идэвхжүүлэх/идэвхгүй болгох.
- `/admin/orders` — Захиалгын түүх, огноо/төлөвөөр шүүх, CSV экспорт.
- `/admin/reports` — Сар сонгож дэлгэрэнгүй тайлан: ангилалаар орлогын
  задаргаа, хамгийн их зарагдсан хоолнууд.

## 1. Supabase төслөө үүсгэх

1. [supabase.com](https://supabase.com) дээр шинэ төсөл (project) үүсгэ.
2. Supabase Dashboard → **SQL Editor** руу орж `supabase/migrations/0001_init.sql`
   файлын агуулгыг хуулж ажиллуул. Энэ нь дараах хүснэгтүүдийг үүсгэнэ:
   `categories`, `menu_items`, `orders`, `order_items` — мөн Row Level Security
   (RLS) policy-уудыг тохируулж, жишээ өгөгдөл (seed) нэмнэ.
   - Нэвтрээгүй хэрэглэгч (QR уншуулсан зочин): цэс унших, захиалга үүсгэх л боломжтой.
   - Нэвтэрсэн хэрэглэгч (админ/ажилтан): бүх мэдээллийг унших, засах, устгах эрхтэй.
3. Supabase Dashboard → **Authentication → Users** руу орж, ресторан
   эзэмшигчид/ажилтанд зориулж email/password хэрэглэгч гараар нэмнэ
   (эсвэл "Invite user"). Энэ систем нь нэг байгууллагад зориулагдсан тул
   бүх бүртгэлтэй хэрэглэгч admin эрхтэй гэж үзнэ.
4. Dashboard → **Project Settings → API** хэсгээс `Project URL` болон
   `anon public` key-г ав.

## 2. Орчны хувьсагч (environment variables)

`.env.local.example`-г хуулж `.env.local` үүсгээд утгуудыг оруул:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Локал ажиллуулах

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) нээхэд `/menu` рүү автоматаар шилждэг.
Админ хэсэгт [http://localhost:3000/admin/login](http://localhost:3000/admin/login)-с нэвтэрнэ.

## 4. Менюгээ шинэчлэх

- **Админ самбараар (хамгийн хялбар):** `/admin/menu` руу нэвтэрч ангилал/хоол
  нэмэх, засах, үнэ өөрчлөх, идэвхгүй болгох боломжтой. Өөрчлөлт шууд `/menu`
  дээр харагдана.
- **Брэндийн өнгө/нэр:** `src/lib/restaurant.ts` файл дахь `name`, `logo`,
  `colors.primary`, `colors.secondary` утгыг өөрчил — бүх апп даяар CSS
  хувьсагчаар дамжин шинэчлэгдэнэ.

## 5. QR код үүсгэх

Deploy хийсний дараа менюгийн URL-аа QR болгож үүсгэ:

```bash
npm run generate-qr -- https://your-restaurant.vercel.app/menu
```

`public/menu-qr.png` файлд хадгалагдана — үүнийгээ хэвлэж ширээн дээр байрлуул.
Олон ширээнд нэг л QR ашиглаж болно (`table_number`-г захиалга өгөх үедээ
зочин гараар бичнэ), эсвэл ширээ тус бүрт өөр URL (`?table=5`) үүсгэж болно.

## 6. Vercel дээр deploy хийх

1. Энэ repo-г GitHub дээр push хийгээд [vercel.com/new](https://vercel.com/new)-ээр импорт хий.
2. Vercel project settings → Environment Variables хэсэгт
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`-г нэм.
3. Deploy хийсний дараа бодит URL-аараа дахин QR код үүсгэ (алхам 5).

## Мэдээллийн бүтэц (Supabase schema)

```
categories        (id, name, sort_order)
menu_items        (id, category_id, name, description, price, image_url, is_available, tags, sort_order)
orders            (id, table_number, status, total_amount, created_at)
order_items       (id, order_id, menu_item_id, quantity, price_at_order_time)
```

Тооцооллууд (`src/lib/data.ts`):

- **Сарын орлого** = цуцлагдаагүй захиалгуудын `total_amount`-ийн нийлбэр, тухайн сард.
- **Өсөлт/бууралт %** = (энэ сар − өмнөх сар) / өмнөх сар × 100.
- **Хамгийн их зарагдсан** = `order_items.quantity`-ийн нийлбэрээр эрэмбэлсэн.
- **Дундаж захиалгын үнэ** = сарын орлого / идэвхтэй захиалгын тоо.

## Технологи

- Next.js 16 (App Router, Server Actions, Proxy — Next 16-д Middleware-ийн
  оронд `proxy.ts` нэртэй болсон)
- Supabase (Postgres + Auth + Row Level Security)
- Tailwind CSS v4 (mobile-first, CSS variable-аар брэндчилдэг)
- Recharts (орлогын trend, ангилалын breakdown график)
# jaranqr
