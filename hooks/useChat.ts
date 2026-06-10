import { useEffect, useState } from "react";
import { enviarMensaje } from "@/lib/openrouter";
import { supabase } from "@/lib/supabase";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

type Personaje = {
  id: string;
  nombre: string;
  descripcion: string;
  system_prompt: string;
  image_url: string;
};

export function useChat(personajeId?: string) {
  const [personaje, setPersonaje] = useState<Personaje | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversacionId, setConversacionId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let query = supabase.from("personaje").select("*");
    if (personajeId) {
      query = query.eq("id", personajeId);
    }
    query.limit(1).then(({ data, error }) => {
      if (error || !data?.[0]) {
        setInitialLoading(false);
        return;
      }
      const p = data[0];
      setPersonaje(p);

      supabase
        .from("conversacion")
        .select("id")
        .eq("personaje_id", p.id)
        .order("creado_en", { ascending: false })
        .limit(1)
        .then(({ data: convData }) => {
          if (convData?.[0]) {
            const convId = convData[0].id;
            setConversacionId(convId);

            supabase
              .from("mensaje")
              .select("rol, contenido")
              .eq("conversacion_id", convId)
              .order("timestamp", { ascending: true })
              .then(({ data: mensajes }) => {
                if (mensajes) {
                  setMessages(
                    mensajes.map((m) => ({
                      role: m.rol as "user" | "assistant",
                      content: m.contenido,
                    })),
                  );
                }
                setInitialLoading(false);
              });
          } else {
            supabase
              .from("conversacion")
              .insert({
                personaje_id: p.id,
                titulo: "",
                resumen: "",
              })
              .select("id")
              .limit(1)
              .then(({ data: newConv }) => {
                if (newConv?.[0]) setConversacionId(newConv[0].id);
                setInitialLoading(false);
              });
          }
        });
    });
  }, [personajeId]);

  async function handleSend() {
    if (!inputText.trim() || !personaje || loading) return;

    const userContent = inputText.trim();
    const userMsg: Message = { role: "user", content: userContent };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const respuesta = await enviarMensaje(personaje.system_prompt, [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userContent },
      ]);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: respuesta },
      ]);

      if (conversacionId) {
        await supabase.from("mensaje").insert([
          {
            conversacion_id: conversacionId,
            rol: "user",
            contenido: userContent,
            timestamp: new Date().toISOString(),
          },
          {
            conversacion_id: conversacionId,
            rol: "assistant",
            contenido: respuesta,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.log("[chat] ERROR:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error al obtener respuesta" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return {
    personaje,
    messages,
    inputText,
    setInputText,
    loading,
    initialLoading,
    handleSend,
    conversacionId,
  };
}
