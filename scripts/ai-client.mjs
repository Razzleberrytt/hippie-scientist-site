import process from "node:process";

export function getAiEnv() {
  const url = process.env.LLM_API_URL || "";
  const key = process.env.LLM_API_KEY || "";
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  return { url, key, model };
}

export function haveAiSecrets() {
  const { url, key } = getAiEnv();
  return Boolean(url && key);
}

export async function promptLLM({ system, prompt }) {
  const { url, key, model } = getAiEnv();
  if (!url || !key) {
    throw new Error("LLM disabled: set LLM_API_URL and LLM_API_KEY to enable.");
  }

  const res = await fetch(`${url}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      messages: [
        system ? { role: "system", content: system } : null,
        { role: "user", content: prompt }
      ].filter(Boolean),
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM request failed: ${res.status} ${res.statusText} ${text}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}
