export async function POST(req) {
  try {
    const body = await req.json();
    console.log("TG UPDATE:", body);

    const BOT_TOKEN = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID;
    const text = body?.text;

    if (chatId && text) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Ти написав: ${text}`,
        }),
      });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error", { status: 500 });
  }
}
