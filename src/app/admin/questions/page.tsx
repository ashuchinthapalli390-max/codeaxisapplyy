"use client";

import React, { useState } from "react";
import { HelpCircle, Plus, Sparkles, Trash2, CheckCircle2 } from "lucide-react";
import { playButtonClick } from "@/lib/audio";

export default function AdminQuestionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Python");

  const categories = ["C", "Python", "Java", "HTML", "Vibe Coding", "Mindset"];

  const sampleQuestions = [
    { id: "1", cat: "Python", level: "Learner", q: "What is the output of print(2 ** 3) in Python?", ans: "8", weight: 3 },
    { id: "2", cat: "Python", level: "Basic", q: "Which syntax is used to define blocks of code in Python?", ans: "Indentation", weight: 3 },
    { id: "3", cat: "Python", level: "Average", q: "What is the difference between List and Tuple?", ans: "Lists are mutable, Tuples are immutable", weight: 3 },
    { id: "4", cat: "C", level: "Learner", q: "Which header file is required for printf() and scanf()?", ans: "<stdio.h>", weight: 3 },
    { id: "5", cat: "Java", level: "Basic", q: "Which keyword is used to inherit a class in Java?", ans: "extends", weight: 3 },
    { id: "6", cat: "HTML", level: "Basic", q: "Which HTML5 element is used to embed native video?", ans: "<video>", weight: 3 },
    { id: "7", cat: "Vibe Coding", level: "Average", q: "How to best verify AI output in Vibe Coding?", ans: "Inspect, test, and review diffs", weight: 3 },
    { id: "8", cat: "Mindset", level: "Standard", q: "If a task feels difficult after 3 days, what will you do?", ans: "Ask for help, understand mistakes, and try again", weight: 2 },
  ];

  const filtered = sampleQuestions.filter((q) => q.cat === selectedCategory);

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="flex items-center justify-between border-b border-red-950 pb-4">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
            ADAPTIVE ASSESSMENT ENGINE
          </span>
          <h1 className="text-2xl font-black text-white uppercase">
            Question Bank Manager
          </h1>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center overflow-x-auto gap-2 border-b border-red-950 pb-3">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              playButtonClick();
              setSelectedCategory(c);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === c
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                : "bg-black/60 border border-red-950 text-slate-400 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="red-glass rounded-3xl p-6 border border-red-500/30 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase">
          {selectedCategory} Question Bank ({filtered.length} items active)
        </h3>

        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-black/60 border border-red-950 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold border border-red-900">
                    {item.level}
                  </span>
                  <span className="text-xs font-bold text-white">{item.q}</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold">Correct Key / Solution: {item.ans}</div>
              </div>
              <span className="text-[10px] text-slate-500 font-bold shrink-0">{item.weight} pts</span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs">
              No questions found for {selectedCategory}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
