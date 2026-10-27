import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { ArticleImage } from "@/types";

interface TechnicalDiagramProps {
  image: ArticleImage;
  priority?: boolean;
  compact?: boolean;
  showCaption?: boolean;
  className?: string;
}

export function TechnicalDiagram({
  image,
  priority = false,
  showCaption = false,
  className = "",
}: TechnicalDiagramProps) {
  const isCustomUploadedUrl =
    image.url.startsWith("data:image/") ||
    image.url.startsWith("http://") ||
    image.url.startsWith("https://") ||
    image.diagramType === "custom-upload";

  return (
    <figure className={`w-full ${className}`}>
      <div
        role="img"
        aria-label={image.alt}
        className="relative w-full aspect-[16/10] rounded-[18px] overflow-hidden inset-vignette-panel flex items-center justify-center p-4 sm:p-5 select-none"
      >
        {/* Faint diagonal glass sheen at top left */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 vignette-sheen"
        />

        {isCustomUploadedUrl ? (
          <img
            src={image.url}
            alt={image.alt}
            width={image.width || 1200}
            height={image.height || 750}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="relative z-10 w-full h-full object-cover rounded-[12px]"
          />
        ) : (
          <VignetteScene type={image.diagramType || "utf8-pipeline"} />
        )}
      </div>

      {showCaption && image.caption && (
        <figcaption className="mt-2.5 text-[14px] text-muted leading-relaxed px-1">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

function VignetteScene({
  type,
}: {
  type: NonNullable<ArticleImage["diagramType"]>;
}) {
  switch (type) {
    /* 1. JSON Schema Validation: small JSON snippet with valid & invalid line marker */
    case "json-schema":
      return (
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[290px] flex flex-col gap-2"
        >
          <div className="rounded-[14px] bg-surface shadow-card px-3.5 py-2.5 -rotate-1 space-y-1.5">
            <div className="flex items-center justify-between text-[12px] font-mono">
              <span className="text-ink">{`"id": "10492",`}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-bg text-badge-text font-sans font-medium text-[11px]">
                <Check className="w-3 h-3" strokeWidth={1.5} />
                Valid
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] font-mono pt-1 border-t border-hairline">
              <span className="text-secondary line-through decoration-muted">
                {`"active": true,}`}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-page text-secondary border border-hairline font-sans font-medium text-[11px]">
                Trailing comma
              </span>
            </div>
          </div>

          <div className="self-end rounded-[12px] bg-surface shadow-secondary px-3 py-1.5 rotate-2 text-[12px] font-mono text-navy">
            {`{"active": true}`}
          </div>
        </div>
      );

    /* 2. Git line endings: a two line diff showing CRLF versus LF */
    case "git-crlf":
      return (
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[290px] flex flex-col gap-2"
        >
          <div className="rounded-[14px] bg-surface shadow-card p-3 -rotate-2 space-y-1.5 font-mono text-[12px]">
            <div className="flex items-center justify-between px-2.5 py-1 rounded-[8px] bg-page text-secondary">
              <span>- export default app\r\n</span>
              <span className="font-sans font-medium text-[11px] text-muted">
                CRLF
              </span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1 rounded-[8px] bg-badge-bg text-badge-text">
              <span>+ export default app\n</span>
              <span className="font-sans font-medium text-[11px]">LF</span>
            </div>
          </div>
          <div className="self-end rounded-full bg-surface shadow-secondary px-3 py-1 rotate-1 text-[12px] font-mono text-ink">
            * text=auto eol=lf
          </div>
        </div>
      );

    /* 3. Markdown masterclass: a Markdown source line next to its rendered table row */
    case "markdown-ast":
      return (
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[296px] flex flex-col gap-2"
        >
          <div className="rounded-[12px] bg-surface shadow-secondary px-3 py-2 -rotate-2 font-mono text-[12px] text-secondary">
            | Flag | Behavior |
          </div>
          <div className="rounded-[14px] bg-surface shadow-card p-2.5 rotate-1">
            <div className="grid grid-cols-2 gap-2 text-[12px] px-2 py-1 rounded-[8px] bg-badge-bg text-badge-text font-semibold">
              <span>Flag</span>
              <span>Behavior</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[12px] px-2 pt-1.5 text-ink">
              <span className="font-mono">--strict</span>
              <span>Clean output</span>
            </div>
          </div>
        </div>
      );

    /* 4. High RAM and CPU in browsers: a simple process list with horizontal bars, no numbers */
    case "browser-memory":
      return (
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[285px] rounded-[14px] bg-surface shadow-card p-3.5 -rotate-1 space-y-2.5"
        >
          {[
            { label: "Browser", width: "w-2/5" },
            { label: "GPU Process", width: "w-1/2" },
            { label: "Tab Renderer", width: "w-4/5" },
          ].map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="flex items-center justify-between text-[12px] font-medium text-ink">
                <span>{row.label}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-badge-dot" />
              </div>
              <div className="h-2 w-full rounded-full bg-badge-bg overflow-hidden">
                <div className={`h-full ${row.width} rounded-full bg-navy`} />
              </div>
            </div>
          ))}
        </div>
      );

    /* 5. Regular expressions: a pattern with highlighted matches in a sample line */
    case "regex-nfa":
      return (
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[290px] flex flex-col gap-2"
        >
          <div className="self-start rounded-full bg-surface shadow-secondary px-3 py-1 -rotate-2 font-mono text-[12px] text-navy">
            /\[ERROR\]/g
          </div>
          <div className="rounded-[14px] bg-surface shadow-card px-3.5 py-2.5 rotate-1 font-mono text-[12px] text-secondary flex items-center gap-1.5 flex-wrap">
            <span>app.log:</span>
            <span className="px-2 py-0.5 rounded-[6px] bg-badge-bg text-badge-text font-semibold">
              [ERROR]
            </span>
            <span>connection reset</span>
          </div>
        </div>
      );

    /* 6. Core Web Vitals: two small gauges using Google's real thresholds (LCP 2.5 s or less, CLS 0.1 or less) */
    case "cwv-timeline":
      return (
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[290px] grid grid-cols-2 gap-2.5"
        >
          <div className="rounded-[14px] bg-surface shadow-card p-3 -rotate-2 space-y-2">
            <div className="flex items-center justify-between text-[12px] font-semibold text-ink">
              <span>LCP</span>
              <span className="w-2 h-2 rounded-full bg-badge-dot" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-badge-bg overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-navy" />
            </div>
            <div className="text-[12px] font-medium text-secondary">
              2.5 s or less
            </div>
          </div>

          <div className="rounded-[14px] bg-surface shadow-card p-3 rotate-2 space-y-2">
            <div className="flex items-center justify-between text-[12px] font-semibold text-ink">
              <span>CLS</span>
              <span className="w-2 h-2 rounded-full bg-badge-dot" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-badge-bg overflow-hidden">
              <div className="h-full w-4/5 rounded-full bg-navy" />
            </div>
            <div className="text-[12px] font-medium text-secondary">
              0.1 or less
            </div>
          </div>
        </div>
      );

    /* 7. Copy pasted code: smart quotes becoming straight quotes in a command */
    case "hidden-chars-ast":
      return (
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[290px] flex flex-col gap-2"
        >
          <div className="rounded-[12px] bg-surface shadow-secondary px-3 py-2 -rotate-2 font-mono text-[12px] text-secondary flex items-center justify-between">
            <span>curl —header “Auth”</span>
            <span className="font-sans text-[11px] text-muted">Curly</span>
          </div>
          <div className="rounded-[14px] bg-surface shadow-card px-3.5 py-2.5 rotate-1 font-mono text-[12px] text-ink flex items-center justify-between">
            <span>{`curl --header "Auth"`}</span>
            <span className="px-2 py-0.5 rounded-full bg-badge-bg text-badge-text font-sans font-medium text-[11px]">
              ASCII
            </span>
          </div>
        </div>
      );

    /* 8. PDF text cleanup: broken lines merging into one clean paragraph */
    case "pdf-normalization":
      return (
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[290px] flex items-center gap-2"
        >
          <div className="flex-1 rounded-[12px] bg-surface shadow-secondary p-2.5 -rotate-2 space-y-1 text-[11px] text-muted leading-tight">
            <div className="bg-page px-2 py-1 rounded">System Guide-</div>
            <div className="bg-page px-2 py-1 rounded">lines for clean</div>
            <div className="bg-page px-2 py-1 rounded">text flow.</div>
          </div>
          <ArrowRight className="w-4 h-4 text-navy shrink-0" strokeWidth={1.5} />
          <div className="flex-1 rounded-[14px] bg-surface shadow-card p-3 rotate-2 text-[12px] font-medium text-ink leading-snug">
            System Guidelines for clean text flow.
          </div>
        </div>
      );

    /* 9. ERR_SSL_PROTOCOL_ERROR: a small browser error card with the error name */
    case "ssl-handshake":
      return (
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[285px] flex flex-col gap-2"
        >
          <div className="rounded-[14px] bg-surface shadow-card p-3.5 -rotate-2 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-badge-dot" />
              <span className="text-[12px] font-semibold text-ink">
                Connection error
              </span>
            </div>
            <div className="px-2.5 py-1.5 rounded-[8px] bg-badge-bg font-mono text-[12px] text-badge-text font-medium truncate">
              ERR_SSL_PROTOCOL_ERROR
            </div>
          </div>
          <div className="self-end rounded-full bg-surface shadow-secondary px-3 py-1 rotate-2 text-[12px] font-medium text-navy inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>TLS 1.3 handshake verified</span>
          </div>
        </div>
      );

    /* 10. UTF-8 and mojibake: "Ã©" and "â€™" turning into "é" and "’" */
    case "utf8-pipeline":
    default:
      return (
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[285px] flex items-center justify-center gap-2.5"
        >
          <div className="flex-1 rounded-[14px] bg-surface shadow-secondary p-3 -rotate-3 text-center space-y-1">
            <div className="text-[11px] font-medium text-muted">Mojibake</div>
            <div className="font-mono text-[15px] font-semibold text-secondary">
              Ã© &middot; â€™
            </div>
          </div>

          <div className="h-8 w-8 rounded-full bg-surface shadow-secondary flex items-center justify-center text-navy shrink-0">
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </div>

          <div className="flex-1 rounded-[14px] bg-surface shadow-card p-3 rotate-2 text-center space-y-1">
            <div className="text-[11px] font-medium text-badge-text">UTF-8</div>
            <div className="font-sans text-[16px] font-semibold text-ink">
              &eacute; &middot; &rsquo;
            </div>
          </div>
        </div>
      );
  }
}
