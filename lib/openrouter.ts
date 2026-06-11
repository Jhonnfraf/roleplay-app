export async function enviarMensaje(systemPrompt: string, messages: any[]) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sao10k/l3.3-euryale-70b",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${body}`);
  }

  const json = await response.json();

  if (!json.choices?.[0]?.message?.content) {
    throw new Error("OpenRouter: respuesta sin choices");
  }

  return json.choices[0].message.content;
}
