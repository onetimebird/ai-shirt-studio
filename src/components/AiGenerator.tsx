// src/components/AiGenerator.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface PromptRow { id: string; prompt: string; }

export function AiGenerator({ onImage }: { onImage(url: string): void }) {
  const [prompt, setPrompt]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [history, setHistory]   = useState<PromptRow[]>([]);
  const [results, setResults]   = useState<string[]>([]);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prompts } = await supabase
        .from<PromptRow>("ai_prompts")
        .select("id,prompt")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setHistory(prompts || []);
    })();
  }, []);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      // 1. Call your Edge Function
      const fn = await fetch(
        "https://rdrkdxvucggzagbcunyn.functions.supabase.co/generate-image",
        {
          method:  "POST",
          headers: {"Content-Type":"application/json"},
          body:    JSON.stringify({ prompt, width:512, height:512 }),
        }
      );
      const { url, error: fnErr } = await fn.json();
      if (fnErr) throw new Error(fnErr);

      // 2. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 3. Save the prompt
      const { data: pRec, error: pErr } = await supabase
        .from("ai_prompts")
        .insert({ user_id: user.id, prompt })
        .select()
        .single();
      if (pErr || !pRec) throw pErr || new Error("Prompt insert failed");

      // 4. Save the generated image URL
      const { error: iErr } = await supabase
        .from("generated_images")
        .insert({ prompt_id: pRec.id, image_url: url });
      if (iErr) throw iErr;

      // 5. Update UI & drop image onto canvas
      setHistory([{ id: pRec.id, prompt }, ...history].slice(0,10));
      setResults([url, ...results]);
      onImage(url);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        rows={3}
        className="w-full p-2 border rounded"
        placeholder="Describe your design..."
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />

      <div className="flex items-center space-x-2">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          onClick={generate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Generating…" : "✨ Generate"}
        </button>

        {history.length > 0 && (
          <select
            className="border p-1"
            onChange={e => {
              const sel = history.find(h => h.id === e.target.value);
              if (sel) setPrompt(sel.prompt);
            }}
            defaultValue=""
          >
            <option value="" disabled>Previous Prompts</option>
            {history.map(h => (
              <option key={h.id} value={h.id}>
                {h.prompt.slice(0,30) + (h.prompt.length>30 ? "…" : "")}
              </option>
            ))}
          </select>
        )}

        <button
          className="underline text-sm"
          onClick={() => setShowTips(true)}
        >
          Prompt tips
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {results.map((src,i) =>
          <img
            key={i}
            src={src}
            className="cursor-pointer border hover:ring-2"
            onClick={() => onImage(src)}
          />
        )}
      </div>

      {showTips && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm">
            <h2 className="text-xl mb-2">Prompt Tips</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Be specific (“Vintage logo vector”)</li>
              <li>Include style (“flat minimal”)</li>
              <li>Mood/colors (“pastel, bold”)</li>
            </ul>
            <button className="mt-4 underline" onClick={() => setShowTips(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

