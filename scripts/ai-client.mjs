// Minimal, provider-agnostic LLM POST client.
// Configure via env: LLM_API_URL, LLM_API_KEY, LLM_MODEL
import fs from "fs";

export async function llmGenerate({ system, user, json=false }) {
  const url   = process.env.LLM_API_URL;   // e.g., https://api.openai.com/v1/chat/completions
  const key   = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  if (!url || !key) throw new Error("Missing LLM_API_URL or LLM_API_KEY");

  const body = url.includes("chat")
    ? { model, temperature: 0.7, response_format: json ? { type: "json_object" } : undefined,
        messages: [{ role:"system", content:system }, { role:"user", content:user }] }
    : { model, input: [{ role:"system", content:system }, { role:"user", content:user }] };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`LLM HTTP ${r.status}: ${await r.text()}`);

  const data = await r.json();

  // Try a few shapes without binding to a specific vendor.
  const content =
    data.choices?.[0]?.message?.content ??
    data.output?.[0]?.content ??
    data.choices?.[0]?.text ??
    JSON.stringify(data);

  return content;
}
