// src/components/AIArtPanel.tsx
import React, { useState } from "react";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcmtkeHZ1dWNnZ3phZ2JjdW55biIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzUzODM2NDM2LCJleHAiOjIwNjk0MTI0MzZ9.DNejRBaelUIeHR8YedekvpKV-faOfRjhyvU8zbiowuU";
const FUNCTION_URL     = "https://rdrkdxvucggzagbcunyn.functions.supabase.co/generate-image";

export function AIArtPanel() {
  const [prompt, setPrompt]   = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages]   = useState<string[]>([]);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt, width: 512, height: 512 }),
      });
      const text = await resp.text();
      let json;
      try { json = JSON.parse(text); }
      catch { throw new Error(`Non-JSON response: ${text}`); }
      if (!resp.ok) {
        const msg = json.error?.message || JSON.stringify(json);
        throw new Error(`Error ${resp.status}: ${msg}`);
      }
      const url = json.data?.[0]?.url;
      if (!url) throw new Error(`No URL in response: ${text}`);
      setImages((imgs) => [url, ...imgs]);
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate image: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <textarea
        rows={4}
        className="w-full p-2 border rounded"
        placeholder="Describe what you want to create"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        disabled={loading || !prompt.trim()}
        onClick={generate}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded disabled:opacity-50"
      >
        {loading ? "Generating…" : "✨ Generate"}
      </button>
      <div className="grid grid-cols-3 gap-2">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            className="cursor-pointer border hover:ring-2"
            onClick={() => window.designCanvas.addImageFromUrl(src)}
          />
        ))}
      </div>
    </div>
  );
}
