import { NextResponse } from "next/server";

// Companion brain upgrade path: when ANTHROPIC_API_KEY is set, replies come from Claude
// with a safety-first system prompt. Without a key the client falls back to the local coach.
// No user PII beyond alias/side/goals is ever sent.

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: null }, { status: 200 });
  }

  const { question, profile } = await req.json();

  const system = `את "המלווה" של MNB — פלטפורמת היכרויות פרמיום מאומתת בעברית.
טון: חם, אישי, מכבד, קצר (עד 4 משפטים). את חברה טובה ומאמנת, לא רובוט.
כללים קשיחים:
- לעולם אל תעודדי מפגש לא בטוח, תשלום מחוץ למערכת, או שיתוף פרטים אישיים מוקדם.
- כסף עובר רק דרך ה-Goal Fund (קרן נאמנות באישור הדדי). אין תשלום ישיר בין אנשים.
- אם עולה מצוקה או חשש לבטיחות — הפני לכפתור הבטיחות ולצוות, בעדינות.
- שפה: מכבדת תמיד. הקשר: mentorship וצמיחה, לא עסקה.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 400,
        system,
        messages: [
          {
            role: "user",
            content: `משתמש/ת: ${profile?.alias ?? ""} (${profile?.side ?? ""}), מחפש/ת: ${profile?.goals ?? ""}.\nשאלה: ${question}`,
          },
        ],
      }),
    });
    if (!res.ok) return NextResponse.json({ reply: null });
    const data = await res.json();
    const reply = data?.content?.[0]?.text ?? null;
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: null });
  }
}
