export async function enviarMensaje(systemPrompt: string, messages: any[]) {
  console.log("URL:", "https://openrouter.ai/api/v1/chat/completions");
  console.log("Key existe:", !!process.env.EXPO_PUBLIC_OPENROUTER_API_KEY);
  console.log(
    "Body:",
    JSON.stringify({
      model: "sao10k/l3.3-euryale-70b",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  );
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
  const json = await response.json();
  return json.choices[0].message.content;
}
