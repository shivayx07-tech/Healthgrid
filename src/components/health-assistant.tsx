import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleHeart, RotateCcw, X } from "lucide-react";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import avatar from "@/assets/assistant-avatar.jpg";

export const STORE_KEY = "kmh-arogya-chat";
const SUGGESTIONS = [
  "I've had a mild fever and body ache for 2 days",
  "Make a 1-day vegetarian meal plan for diabetes",
  "What should I eat to recover from jaundice?",
];

export function ChatWindow({ initial, onReset, suggestions = SUGGESTIONS }: { initial: UIMessage[]; onReset: () => void; suggestions?: string[] }) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, stop } = useChat({
    id: "arogya",
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => setError(e.message || "Something went wrong. Please try again."),
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" || status === "error") {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
      inputRef.current?.focus();
    }
  }, [messages, status]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    setError(null);
    void sendMessage({ text });
  };
  const handleSubmit = (m: PromptInputMessage) => send(m.text ?? "");

  const last = messages[messages.length - 1];
  const waiting = status === "submitted" || (status === "streaming" && last?.role === "user");

  return (
    <>
      <div className="assist-head">
        <img src={avatar} alt="" width={40} height={40} />
        <div><strong>Arogya · AI Health Assistant</strong><span><i className="live-dot" />Symptoms & meal plans</span></div>
        <button type="button" className="assist-icon" onClick={onReset} aria-label="Start a new conversation" title="New conversation"><RotateCcw /></button>
      </div>
      <Conversation className="assist-convo">
        <ConversationContent className="gap-4 p-4">
          {messages.length === 0 && (
            <div className="assist-empty">
              <img src={avatar} alt="" width={64} height={64} />
              <p>Namaste! Tell me how you're feeling, or ask for a personalised meal plan.</p>
              <div className="assist-suggest">
                {suggestions.map(s => <button key={s} type="button" onClick={() => send(s)}>{s}</button>)}
              </div>
            </div>
          )}
          {messages.map(m => (
            <Message key={m.id} from={m.role}>
              <MessageContent className={m.role === "user" ? "assist-bubble-user" : "assist-bubble-ai"}>
                {m.parts.map((p, i) => p.type === "text"
                  ? (m.role === "user" ? <span key={i}>{p.text}</span> : <MessageResponse key={i}>{p.text}</MessageResponse>)
                  : null)}
              </MessageContent>
            </Message>
          ))}
          {waiting && <div className="assist-wait"><Shimmer>Arogya is thinking…</Shimmer></div>}
          {error && <div className="assist-error" role="alert">{error}</div>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="assist-compose">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea ref={inputRef} placeholder="Describe symptoms or ask for a meal plan…" />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} size="icon-sm" />
          </PromptInputFooter>
        </PromptInput>
        <p className="assist-note">AI guidance only — not a diagnosis. In an emergency call 108.</p>
      </div>
    </>
  );
}

export function HealthAssistant() {
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!open || initial) return;
    try { setInitial(JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]") as UIMessage[]); } catch { setInitial([]); }
  }, [open, initial]);

  const reset = () => {
    try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
    setInitial([]);
    setKey(k => k + 1);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            className="assist-panel"
            role="dialog"
            aria-label="AI Health Assistant"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            {initial && <ChatWindow key={key} initial={initial} onReset={reset} />}
          </motion.section>
        )}
      </AnimatePresence>
      <button type="button" className="assist-fab" onClick={() => setOpen(o => !o)} aria-label={open ? "Close AI Health Assistant" : "Open AI Health Assistant"} aria-expanded={open}>
        {open ? <X /> : <MessageCircleHeart />}
        {!open && <span>AI Health Assistant</span>}
      </button>
    </>
  );
}
