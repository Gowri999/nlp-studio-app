import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, Pause, Play, Square, Trash2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { RequireAuth } from "@/components/RequireAuth";
import { useSpeech } from "@/lib/speech";
import { VoiceUnsupportedNotice } from "@/components/ListenButton";

export const Route = createFileRoute("/voice-reader")({
  head: () => ({
    meta: [
      { title: "Voice Reader — NLP Studio" },
      { name: "description", content: "Read any text aloud with karaoke highlighting, voices, speed and pitch control." },
    ],
  }),
  component: ProtectedPage,
});

const SAMPLE = "Welcome to NLP Studio Voice Reader. Type or paste any text here and listen to it with natural-sounding voices, adjustable speed, pitch, and volume.";

function Page() {
  const { supported, voices, settings, setSettings, speak, stop, pause, resume, speaking, paused, speakingId } = useSpeech();
  const [text, setText] = useState(SAMPLE);
  const [lang, setLang] = useState<string>("en-US");
  const [filter, setFilter] = useState<"all" | "female" | "male">("all");
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);

  const ID = "voice-reader";
  const active = speakingId === ID && speaking;

  const filteredVoices = useMemo(() => {
    const inLang = voices.filter((v) => !lang || v.lang.toLowerCase().startsWith(lang.split("-")[0].toLowerCase()));
    const list = inLang.length ? inLang : voices;
    if (filter === "all") return list;
    const female = /female|woman|zira|samantha|victoria|karen|moira|tessa|fiona/i;
    const male = /male|man|david|alex|daniel|fred|tom|george/i;
    return list.filter((v) => (filter === "female" ? female.test(v.name) : male.test(v.name)));
  }, [voices, lang, filter]);

  const langs = useMemo(() => {
    const set = new Set(voices.map((v) => v.lang));
    return [...set].sort();
  }, [voices]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const onPlay = () => {
    if (!text.trim()) return;
    setHighlightIdx(null);
    speak(text, ID, {
      lang,
      onWord: (charIndex) => setHighlightIdx(charIndex),
      onEnd: () => setHighlightIdx(null),
    });
  };

  const renderKaraoke = () => {
    if (highlightIdx === null) return text;
    // find the word containing highlightIdx
    const before = text.slice(0, highlightIdx);
    const rest = text.slice(highlightIdx);
    const m = rest.match(/^\S+/);
    const word = m ? m[0] : "";
    const after = rest.slice(word.length);
    return (
      <>
        {before}
        <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded px-1">{word}</span>
        {after}
      </>
    );
  };

  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-accent font-medium mb-4">
              <Volume2 className="w-3.5 h-3.5" /> TEXT-TO-SPEECH
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="text-gradient">Voice Reader</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
              Listen to any text with natural voices, karaoke-style highlighting, and full control over speed, pitch and volume.
            </p>
          </motion.div>

          <VoiceUnsupportedNotice />

          <div className="grid lg:grid-cols-[1fr_320px] gap-6 mt-4">
            <div className="space-y-4">
              <div className="gradient-border p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Your text</label>
                  <Button size="sm" variant="ghost" onClick={() => { setText(""); stop(); setHighlightIdx(null); }} className="h-7 text-xs">
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </Button>
                </div>

                {active ? (
                  <div className="min-h-[260px] rounded-md bg-background/40 border border-white/10 p-3 text-base leading-relaxed whitespace-pre-wrap">
                    {renderKaraoke()}
                  </div>
                ) : (
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste or type any text to read aloud..."
                    className="min-h-[260px] bg-background/40 border-white/10 resize-none text-base"
                  />
                )}

                <div className="flex justify-between text-xs text-muted-foreground mt-3">
                  <span>{wordCount} words</span>
                  <span>{text.length} characters</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    onClick={onPlay}
                    disabled={!supported || !text.trim() || active}
                    className="flex-1 min-w-[140px] bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 border-0"
                  >
                    <Volume2 className="w-4 h-4" /> Read Aloud
                  </Button>
                  {paused ? (
                    <Button onClick={resume} disabled={!active && !paused} variant="outline" className="border-white/10 bg-background/30">
                      <Play className="w-4 h-4" /> Resume
                    </Button>
                  ) : (
                    <Button onClick={pause} disabled={!active} variant="outline" className="border-white/10 bg-background/30">
                      <Pause className="w-4 h-4" /> Pause
                    </Button>
                  )}
                  <Button onClick={() => { stop(); setHighlightIdx(null); }} disabled={!active && !paused} variant="outline" className="border-white/10 bg-background/30">
                    <Square className="w-4 h-4" /> Stop
                  </Button>
                </div>
              </div>
            </div>

            <aside className="gradient-border p-6 rounded-2xl h-fit space-y-5">
              <div className="text-sm font-semibold flex items-center gap-2">
                <Languages className="w-4 h-4 text-accent" /> Voice settings
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Language</label>
                <Select value={lang} onValueChange={setLang}>
                  <SelectTrigger className="bg-background/40 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {langs.length === 0 && <SelectItem value="en-US">English (en-US)</SelectItem>}
                    {langs.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Voice gender</label>
                <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                  <SelectTrigger className="bg-background/40 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All voices</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Voice</label>
                <Select value={settings.voiceURI ?? ""} onValueChange={(v) => setSettings({ voiceURI: v })}>
                  <SelectTrigger className="bg-background/40 border-white/10 mt-1"><SelectValue placeholder="System default" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {filteredVoices.map((v) => (
                      <SelectItem key={v.voiceURI} value={v.voiceURI}>{v.name} — {v.lang}</SelectItem>
                    ))}
                    {filteredVoices.length === 0 && <SelectItem value="none" disabled>No voices match</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <Row label="Speed" value={`${settings.rate.toFixed(2)}x`}>
                <Slider value={[settings.rate]} min={0.5} max={2} step={0.05} onValueChange={(v) => setSettings({ rate: v[0] })} />
              </Row>

              <Row label="Pitch" value={`${settings.pitch.toFixed(1)}`}>
                <Slider value={[settings.pitch]} min={0} max={2} step={0.1} onValueChange={(v) => setSettings({ pitch: v[0] })} />
              </Row>

              <Row label="Volume" value={`${Math.round(settings.volume * 100)}%`}>
                <Slider value={[settings.volume]} min={0} max={1} step={0.05} onValueChange={(v) => setSettings({ volume: v[0] })} />
              </Row>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-accent font-medium">{value}</span>
      </div>
      {children}
    </div>
  );
}

function ProtectedPage() { return (<RequireAuth><Page /></RequireAuth>); }
