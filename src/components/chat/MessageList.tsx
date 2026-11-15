"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Message, ViewPreferences } from "@/lib/types";
import MessageItem from "./MessageItem";
import { ArrowDownIcon } from "@/components/ui/icons";

interface MessageListProps {
  messages: Message[];
  streamingId: string | null;
  prefs: ViewPreferences;
  modelLabel: string;
  onRetry: (messageId: string) => void;
}

function dayLabel(ts: number): string {
  const date = new Date(ts);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  if (start === startToday) return "Today";
  if (start === startToday - 86_400_000) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function MessageList({
  messages,
  streamingId,
  prefs,
  modelLabel,
  onRetry,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const last = messages[messages.length - 1];
  const lastLength = last?.content.length ?? 0;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior });
    pinnedRef.current = true;
    setShowJump(false);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => scrollToBottom("auto"));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (pinnedRef.current) {
      scrollToBottom(streamingId ? "auto" : "smooth");
    } else {
      setShowJump(true);
    }
  }, [messages.length, lastLength, streamingId]);

  useEffect(() => {
    if (!streamingId) setShowJump(false);
  }, [streamingId]);

  const handleScroll = () => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const near = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 130;
    pinnedRef.current = near;
    if (near) setShowJump(false);
  };

  let lastDay = "";

  return (
    <>
      <div className="messages-scroll" ref={scrollRef} onScroll={handleScroll}>
        <div className="messages-inner" role="log" aria-label="Conversation">
          {messages.map((message, index) => {
            const day = dayLabel(message.createdAt);
            const divider = day !== lastDay;
            lastDay = day;
            return (
              <React.Fragment key={message.id}>
                {divider ? (
                  <div className="day-divider">
                    <span>{day}</span>
                  </div>
                ) : null}
                <MessageItem
                  message={message}
                  prefs={prefs}
                  modelLabel={modelLabel}
                  streaming={message.id === streamingId}
                  isLast={index === messages.length - 1}
                  onRetry={onRetry}
                />
              </React.Fragment>
            );
          })}
          <div ref={bottomRef} className="messages-end" />
        </div>
      </div>
      <button
        type="button"
        className={`jump-latest${showJump ? " is-visible" : ""}`}
        onClick={() => scrollToBottom("smooth")}
        aria-label="Jump to latest message"
      >
        <ArrowDownIcon size={15} />
        <span>Latest</span>
      </button>
    </>
  );
}
