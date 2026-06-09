import { StyleSheet, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

import { enviarMensaje } from "@/lib/openrouter";

type Personaje = {
  id: string;
  nombre: string;
  descripcion: string;
  system_prompt: string;
  image_url: string;
};

export default function HomeScreen() {
  const [personaje, setPersonaje] = useState<Personaje | null>(null);

  useEffect(() => {
    async function cargarYEnviar() {
      const { data, error } = await supabase
        .from("personaje")
        .select("*")
        .limit(1);

      if (error) {
        console.log("Error:", error);
        return;
      }

      const p = data[0];
      setPersonaje(p);
      console.log("Personaje cargado:", p);

      const respuesta = await enviarMensaje(p.system_prompt, [
        {
          role: "user",
          content:
            "Hola,¿Cuál es tu nombre? realizame por favor 5 preguntas para saber mas de mi",
        },
      ]);

      console.log("Respuesta:", respuesta);
    }

    cargarYEnviar();
  }, []);

  return (
    <View>
      <Text>{personaje ? personaje.nombre : "Cargando..."}</Text>
      <Text>{personaje ? personaje.descripcion : ""}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
