"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TEXT_TOOLS } from "@/data/tools";
import { ToolSlug } from "@/types";
import { TextToolWorkspace } from "@/components/tools/TextToolWorkspace";
import { ToolDocumentationSection } from "@/components/tools/ToolDocumentationSection";

export function ToolsHubClient() {
  const [selectedSlug, setSelectedSlug] = useState<ToolSlug>(
    "smart-case-formatter"
  );

  const activeTool =
    TEXT_TOOLS.find((t) => t.slug === selectedSlug) || TEXT_TOOLS[0];

  return (
    <div className="space-y-10">
      {/* Interactive Tool Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEXT_TOOLS.map((tool) => {
          const isSelected = tool.slug === selectedSlug;
          return (
            <div
              key={tool.id}
              onClick={() => setSelectedSlug(tool.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedSlug(tool.slug);
                }
              }}
              className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-navy bg-navy/[0.06] dark:bg-navy/[0.12] shadow-sm"
                  : "border-obsidian/[0.08] dark:border-white/[0.08] bg-ivory dark:bg-carbon-card hover:border-navy/40"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold ${
                      isSelected
                        ? "bg-navy text-white"
                        : "bg-obsidian/[0.06] dark:bg-white/[0.08] text-charcoal dark:text-cool-slate"
                    }`}
                  >
                    {tool.badge}
                  </span>
                  <Link
                    href={`/tools/${tool.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-0.5 text-[13px] text-navy dark:text-navy hover:underline"
                  >
                    <span>Open Page</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <h2 className="font-display font-bold text-base text-obsidian dark:text-pearl">
                  {tool.shortName}
                </h2>
                <p className="text-[13px] text-charcoal dark:text-cool-slate line-clamp-2">
                  {tool.tagline}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Tool Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-xl text-obsidian dark:text-pearl">
            {activeTool.name}
          </h2>
          <p className="text-sm text-charcoal dark:text-cool-slate">
            {activeTool.description}
          </p>
        </div>

        <Link
          href={`/tools/${activeTool.slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-ivory dark:bg-carbon-card text-[13px] font-semibold text-obsidian dark:text-pearl hover:border-navy"
        >
          <span>Open Standalone Page</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Live Client-Side Workspace */}
      <TextToolWorkspace slug={activeTool.slug} />

      {/* Educational Documentation & FAQ for the Active Tool */}
      <ToolDocumentationSection tool={activeTool} />
    </div>
  );
}

