import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// IP Rate Limiting map for contact form: max 5 messages per 10 minutes
interface ContactRateRecord {
  count: number;
  resetAt: number;
}
const contactRateLimitMap = new Map<string, ContactRateRecord>();

function checkContactRateLimit(ip: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const rec = contactRateLimitMap.get(ip);
  if (!rec || now > rec.resetAt) {
    contactRateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return { allowed: true };
  }

  if (rec.count >= 5) {
    const waitMinutes = Math.ceil((rec.resetAt - now) / 60000);
    return { allowed: false, waitMinutes };
  }

  rec.count += 1;
  return { allowed: true };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  try {
    // 1. Origin / CSRF check
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      const originHost = origin.replace(/^https?:\/\//, "").split(":")[0];
      const targetHost = host.split(":")[0];
      if (
        originHost !== targetHost &&
        originHost !== "localhost" &&
        originHost !== "127.0.0.1" &&
        !targetHost.endsWith(".vercel.app")
      ) {
        return NextResponse.json(
          { ok: false, error: "Forbidden: Origin validation failed." },
          { status: 403 }
        );
      }
    }

    // 2. Payload size guard (max 32KB for contact message)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 32768) {
      return NextResponse.json(
        { ok: false, error: "Payload too large." },
        { status: 413 }
      );
    }

    // 3. IP Rate Limit
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rate = checkContactRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Too many submissions from your connection. Please wait ${rate.waitMinutes} minute(s) before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 4. Honeypot check (anti-bot trap)
    if (body.hp_website && typeof body.hp_website === "string" && body.hp_website.trim().length > 0) {
      // Silently return success to mislead spambots without sending email
      return NextResponse.json({ ok: true, message: "Thank you for reaching out." });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "Question";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    // 5. Strict Field Validations
    if (!name || name.length > 100) {
      return NextResponse.json(
        { ok: false, error: "Please enter your name (up to 100 characters)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 120) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!subject || subject.length > 200) {
      return NextResponse.json(
        { ok: false, error: "Please enter a subject (up to 200 characters)." },
        { status: 400 }
      );
    }

    if (!message || message.length < 5 || message.length > 5000) {
      return NextResponse.json(
        { ok: false, error: "Message must be between 5 and 5,000 characters." },
        { status: 400 }
      );
    }

    // 6. Send via Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.CONTACT_RECEIVER_EMAIL || "zameerpanhwer67@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Zee Writes <onboarding@resend.dev>";

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeTopic = escapeHtml(topic);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const emailSubject = `[Zee Writes] ${topic}: ${subject}`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="border-bottom: 2px solid #4a74f0; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #031952; font-size: 20px;">Zee Writes — Contact Form Submission</h2>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Direct message received via zeewrites.com/contact</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 100px; font-size: 14px; font-weight: 500;">Sender:</td>
            <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${safeName} &lt;<a href="mailto:${safeEmail}" style="color: #4a74f0; text-decoration: none;">${safeEmail}</a>&gt;</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 500;">Topic:</td>
            <td style="padding: 6px 0; color: #0f172a; font-size: 14px;"><span style="display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600;">${safeTopic}</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 500;">Subject:</td>
            <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${safeSubject}</td>
          </tr>
        </table>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-top: 16px;">
          <h4 style="margin: 0 0 10px 0; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Message Body</h4>
          <div style="color: #0f172a; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</div>
        </div>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; text-align: center;">
          Delivered to ${recipientEmail} • Sender IP: ${ip}
        </div>
      </div>
    `;

    const emailText = `Zee Writes Contact Form Submission\n\nFrom: ${name} <${email}>\nTopic: ${topic}\nSubject: ${subject}\n\nMessage:\n${message}\n\nSender IP: ${ip}`;

    if (resendApiKey) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [recipientEmail],
          reply_to: email,
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
        }),
      });

      if (!resendRes.ok) {
        const errorData = await resendRes.json().catch(() => ({}));
        console.error("Resend API error:", errorData);
        return NextResponse.json(
          {
            ok: false,
            error: errorData.message || "Email provider error. Please try again later.",
          },
          { status: 502 }
        );
      }
    } else {
      console.log(`[Contact Form] (RESEND_API_KEY not configured) Message from ${name} <${email}>: "${subject}"`);
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Thank you! Your message has been sent directly to Zee.",
      },
      {
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
