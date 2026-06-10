import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Personaje = {
  id: string;
  nombre: string;
  descripcion: string;
  system_prompt: string;
  image_url: string;
};

export function usePersonajes() {
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setLoading(true);
    const { data, error } = await supabase
      .from("personaje")
      .select("*");

    if (error) {
      setError(error.message);
    } else {
      setPersonajes(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  return { personajes, loading, error, refetch: cargar };
}
