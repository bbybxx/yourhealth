import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { error: "Telegram не настроен" },
      { status: 500 }
    );
  }

  let body: {
    name?: string;
    phone?: string;
    items?: { name: string; qty: number; total: number }[];
    total?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const name = body.name?.trim() || "—";
  const phone = body.phone?.trim() || "—";
  const items = body.items || [];
  const total = Number(body.total) || 0;

  const lines = items.map(
    (i) => `• ${i.name} × ${i.qty} — ${i.total.toLocaleString("ru-RU")} сом`
  );

  const text = [
    "🛒 <b>Новый заказ</b>",
    "",
    `👤 Имя: <b>${name}</b>`,
    `📞 Телефон: <b>${phone}</b>`,
    "",
    ...(lines.length ? lines : ["—"]),
    "",
    `💰 Итого: <b>${total.toLocaleString("ru-RU")} сом</b>`,
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram sendMessage error:", err);
      return NextResponse.json(
        { error: "Не удалось отправить уведомление" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Telegram sendMessage failed:", e);
    return NextResponse.json(
      { error: "Не удалось отправить уведомление" },
      { status: 502 }
    );
  }
}
