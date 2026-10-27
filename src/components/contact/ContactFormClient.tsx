"use client";

import React, { useState } from "react";
import { Mail, Phone, Clock, Copy, Check, Send } from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";

const TOPICS = ["Question", "Correction", "Guide Request", "Other"] as const;

export function ContactFormClient() {
  const { showToast } = useSite();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("Question");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusText, setStatusText] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }>({});

  const [copiedField, setCopiedField] = useState<"email" | "phone" | null>(
    null
  );

  const handleCopy = (value: string, field: "email" | "phone") => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    showToast(
      field === "email"
        ? "Email copied: zameerpanhwer67@gmail.com"
        : "Phone number copied: 03353162656"
    );
    setTimeout(() => setCopiedField(null), 2200);
  };

  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    } = {};

    if (!name.trim()) {
      errors.name = "Please enter your name.";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!subject.trim()) {
      errors.subject = "Please enter a subject.";
    }
    if (!message.trim()) {
      errors.message = "Please enter a message.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setStatus("error");
      setStatusText("Please fix the highlighted fields above before sending.");
      return;
    }

    setStatus("submitting");
    setStatusText("Preparing your message");

    const finalSubject = subject.trim()
      ? `${selectedTopic}: ${subject.trim()}`
      : `${selectedTopic}: Message from ${name.trim() || "Zee Writes Reader"}`;

    const mailtoSubject = encodeURIComponent(finalSubject);
    const mailtoBody = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\nTopic: ${selectedTopic}\n\n${message.trim()}`
    );

    setStatus("success");
    setStatusText(
      "Opening your email client with your message addressed to zameerpanhwer67@gmail.com."
    );
    window.location.href = `mailto:zameerpanhwer67@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
  };

  return (
    <div className="space-y-14 pb-8">
      {/* Compact Stage Header */}
      <section className="px-[14px]">
        <div className="relative rounded-[32px] border border-hairline stage-panel-gradient overflow-hidden min-h-[250px] sm:min-h-[280px] flex flex-col items-center justify-center py-12 px-4 sm:px-6 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 stage-dot-pattern"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] stage-bottom-fade"
          />

          <div className="relative z-10 max-w-[700px] mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 h-[32px] px-[14px] mb-[20px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
              <span className="w-[6px] h-[6px] rounded-full bg-accent" />
              <span>Direct channels</span>
            </div>

            <h1 className="font-sans font-medium text-[clamp(32px,5.2vw,52px)] leading-[1.08] tracking-[-0.025em] text-ink [text-wrap:balance]">
              Get in <span className="text-navy">Touch</span>
            </h1>

            <p className="mt-[20px] text-[18px] leading-[1.55] text-secondary max-w-[560px] mx-auto [text-wrap:balance]">
              Questions, corrections or ideas? Send me a message.
            </p>
          </div>
        </div>
      </section>

      {/* Main 2-Column Split Layout */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 Cols): Three Info Cards */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card 1: Email */}
            <div className="rounded-[24px] bg-surface border border-hairline shadow-2 p-6 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="h-[36px] w-[36px] rounded-[10px] bg-badge-bg text-navy flex items-center justify-center shrink-0">
                  <Mail className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[14px] font-medium text-muted block">
                    Email
                  </span>
                  <a
                    href="mailto:zameerpanhwer67@gmail.com"
                    className="font-sans text-[16px] font-semibold text-ink hover:text-navy break-all transition-colors duration-micro block"
                  >
                    zameerpanhwer67@gmail.com
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopy("zameerpanhwer67@gmail.com", "email")
                }
                aria-label="Copy email address zameerpanhwer67@gmail.com"
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-full bg-surface border border-hairline shadow-1 hover:shadow-3 text-[13px] font-medium text-ink hover:text-navy transition-all duration-hover ease-out-expo"
              >
                {copiedField === "email" ? (
                  <>
                    <Check className="w-4 h-4 text-navy" strokeWidth={1.5} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Card 2: Phone */}
            <div className="rounded-[24px] bg-surface border border-hairline shadow-2 p-6 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-[36px] w-[36px] rounded-[10px] bg-badge-bg text-navy flex items-center justify-center shrink-0">
                  <Phone className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <span className="text-[14px] font-medium text-muted block">
                    Phone
                  </span>
                  <a
                    href="tel:03353162656"
                    className="font-sans text-[16px] font-semibold text-ink hover:text-navy transition-colors duration-micro block"
                  >
                    03353162656
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy("03353162656", "phone")}
                aria-label="Copy phone number 03353162656"
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-full bg-surface border border-hairline shadow-1 hover:shadow-3 text-[13px] font-medium text-ink hover:text-navy transition-all duration-hover ease-out-expo"
              >
                {copiedField === "phone" ? (
                  <>
                    <Check className="w-4 h-4 text-navy" strokeWidth={1.5} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Card 3: Response Time */}
            <div className="rounded-[24px] bg-surface border border-hairline shadow-2 p-6 flex items-start gap-3.5">
              <div className="h-[36px] w-[36px] rounded-[10px] bg-badge-bg text-navy flex items-center justify-center shrink-0">
                <Clock className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[14px] font-medium text-muted">
                    Response Time
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-bg text-badge-text text-[12px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-dot" />
                    <span>Typically responds within 24h</span>
                  </span>
                </div>
                <p className="text-[16px] font-medium text-ink">
                  &ldquo;I&apos;ll reply as soon as I can.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Send a Message Form Card */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-[24px] bg-surface border border-hairline shadow-2 p-7 sm:p-10 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-hairline">
                <h2 className="font-sans font-semibold text-[24px] text-ink tracking-[-0.02em]">
                  Send a Message
                </h2>
                <span className="text-[14px] font-medium text-muted">
                  Direct to Zee
                </span>
              </div>

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label
                    htmlFor="contact-name"
                    className="text-[14px] font-medium text-ink block"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={
                      fieldErrors.name ? "contact-name-error" : undefined
                    }
                    placeholder="Your name"
                    className="w-full rounded-[14px] border border-hairline bg-surface shadow-1 px-4 py-3 min-h-[48px] text-[16px] text-ink placeholder:text-muted placeholder:opacity-100 focus:outline-none focus:border-[#4a74f0] focus:ring-[3px] focus:ring-[#4a74f0]/35 transition-[box-shadow,border-color] duration-hover ease-out-expo"
                  />
                  {fieldErrors.name && (
                    <p
                      id="contact-name-error"
                      role="alert"
                      className="text-[13px] font-medium text-navy"
                    >
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-email"
                    className="text-[14px] font-medium text-ink block"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          email: undefined,
                        }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? "contact-email-error" : undefined
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-[14px] border border-hairline bg-surface shadow-1 px-4 py-3 min-h-[48px] text-[16px] text-ink placeholder:text-muted placeholder:opacity-100 focus:outline-none focus:border-[#4a74f0] focus:ring-[3px] focus:ring-[#4a74f0]/35 transition-[box-shadow,border-color] duration-hover ease-out-expo"
                  />
                  {fieldErrors.email && (
                    <p
                      id="contact-email-error"
                      role="alert"
                      className="text-[13px] font-medium text-navy"
                    >
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Topic as Single-Select Chips */}
              <div className="space-y-2.5">
                <span
                  id="contact-topic-label"
                  className="text-[14px] font-medium text-ink block"
                >
                  Topic
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="contact-topic-label"
                  className="flex flex-wrap items-center gap-2"
                >
                  {TOPICS.map((topic) => {
                    const active = selectedTopic === topic;
                    return (
                      <button
                        key={topic}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelectedTopic(topic)}
                        className={`px-4 min-h-[44px] rounded-full text-[14px] font-medium border transition-all duration-hover ease-out-expo ${
                          active
                            ? "bg-[#00000e] border-[#00000e] text-white shadow-2"
                            : "bg-surface border-hairline text-ink shadow-1 hover:bg-[#00000e] hover:text-white"
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-2">
                <label
                  htmlFor="contact-subject"
                  className="text-[14px] font-medium text-ink block"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (fieldErrors.subject) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        subject: undefined,
                      }));
                    }
                  }}
                  aria-invalid={Boolean(fieldErrors.subject)}
                  aria-describedby={
                    fieldErrors.subject ? "contact-subject-error" : undefined
                  }
                  placeholder="Brief summary of your question or note"
                  className="w-full rounded-[14px] border border-hairline bg-surface shadow-1 px-4 py-3 min-h-[48px] text-[16px] text-ink placeholder:text-muted placeholder:opacity-100 focus:outline-none focus:border-[#4a74f0] focus:ring-[3px] focus:ring-[#4a74f0]/35 transition-[box-shadow,border-color] duration-hover ease-out-expo"
                />
                {fieldErrors.subject && (
                  <p
                    id="contact-subject-error"
                    role="alert"
                    className="text-[13px] font-medium text-navy"
                  >
                    {fieldErrors.subject}
                  </p>
                )}
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <label
                  htmlFor="contact-message"
                  className="text-[14px] font-medium text-ink block"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (fieldErrors.message) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        message: undefined,
                      }));
                    }
                  }}
                  aria-invalid={Boolean(fieldErrors.message)}
                  aria-describedby={
                    fieldErrors.message ? "contact-message-error" : undefined
                  }
                  placeholder="Write your message here"
                  className="w-full rounded-[14px] border border-hairline bg-surface shadow-1 p-4 text-[16px] text-ink placeholder:text-muted placeholder:opacity-100 focus:outline-none focus:border-[#4a74f0] focus:ring-[3px] focus:ring-[#4a74f0]/35 transition-[box-shadow,border-color] duration-hover ease-out-expo"
                />
                {fieldErrors.message && (
                  <p
                    id="contact-message-error"
                    role="alert"
                    className="text-[13px] font-medium text-navy"
                  >
                    {fieldErrors.message}
                  </p>
                )}
              </div>

              {/* Accessible Form Status Live Region */}
              {status !== "idle" && statusText && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`rounded-[14px] px-4 py-3 text-[14px] font-medium border ${
                    status === "error"
                      ? "bg-page border-focus-blue text-ink"
                      : "bg-badge-bg border-hairline text-badge-text"
                  }`}
                >
                  {statusText}
                </div>
              )}

              {/* Submit Button & Delivers to Line */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2.5 px-7 min-h-[44px] text-[15px] font-medium btn-primary-pill"
                >
                  <span>Send Message</span>
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                </button>

                <span className="text-[14px] text-muted">
                  Delivers to{" "}
                  <a
                    href="mailto:zameerpanhwer67@gmail.com"
                    className="text-navy font-medium underline underline-offset-4 hover:opacity-80 transition-opacity duration-micro"
                  >
                    zameerpanhwer67@gmail.com
                  </a>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
