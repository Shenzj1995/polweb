import { createServerFetch } from "@/lib/proxy-fetch";

const PIAPI_BASE = "https://api.piapi.ai/api/v1";

const SYSTEM_PROMPT =
  "Translate the following text to English. If it is already in English, return it unchanged. Return only the translated text, nothing else.";

export async function translatePrompt(text: string): Promise<string> {
  if (!text || !text.trim()) return text;

  // Quick check: if text is ASCII-only, skip translation
  if (/^[\x00-\x7F]*$/.test(text)) return text;

  try {
    const res = await createServerFetch()(`${PIAPI_BASE}/task`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PIAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        task_type: "chat_completions",
        input: {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: text },
          ],
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    const json = await res.json();
    if (json.code !== 200 || !json.data?.output?.choices?.[0]?.message?.content) {
      return text;
    }

    const translated = json.data.output.choices[0].message.content.trim();
    return translated || text;
  } catch {
    // Fail open: return original prompt if translation fails
    return text;
  }
}
