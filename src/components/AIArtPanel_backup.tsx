// Backup version for reference - this was working 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcmtkeHZ1Y2dnemFnYmN1bnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzY0MzYsImV4cCI6MjA2OTQxMjQzNn0.DNejRBaelUIeHR8YedekvpKV-faOfRjhyvU8zbiowuU";
const FUNCTION_URL = "https://rdrkdxvucggzagbcunyn.functions.supabase.co/generate-image";

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