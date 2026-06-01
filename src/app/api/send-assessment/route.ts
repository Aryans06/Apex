import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function buildEmailHtml(candidateName: string | undefined, claim: string, questions: Array<{ q: string; intent: string }>) {
  const name = candidateName || "Candidate";
  const questionRows = questions.map((q, i) => `
    <div style="margin-bottom:24px;padding:16px;background:#f8f9fa;border-left:3px solid #3b82f6;border-radius:4px;">
      <p style="margin:0 0 8px;font-weight:600;color:#1a1a2e;">Q${i + 1}. ${q.q}</p>
      <p style="margin:0;font-size:13px;color:#6b7280;font-style:italic;">Focus: ${q.intent}</p>
    </div>
  `).join("");

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e;">
      <div style="background:#1a1a2e;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="margin:0;color:#3b82f6;font-size:24px;">⚡ Apex ATS</h1>
        <p style="margin:6px 0 0;color:#9ca3af;font-size:14px;">Skills Assessment</p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px;">
        <p style="font-size:16px;">Hi ${name},</p>
        <p style="color:#4b5563;">You have been sent a technical assessment by a recruiter using Apex ATS. Please review the claim below and answer the questions.</p>

        <div style="margin:24px 0;padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;">
          <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Claim under review</p>
          <p style="margin:8px 0 0;font-style:italic;color:#1e40af;">"${claim}"</p>
        </div>

        <h2 style="font-size:16px;margin:24px 0 16px;">Assessment Questions</h2>
        ${questionRows}

        <p style="font-size:13px;color:#9ca3af;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">
          Sent via Apex ATS · AI-powered hiring intelligence
        </p>
      </div>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const { email, candidateName, claim, questions } = await req.json();

    if (!email || !claim || !questions?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

    if (!smtpConfigured) {
      // Demo mode — log and return success so the UI flow works without SMTP setup
      console.log(`[Apex Assessment Email — Demo Mode]`);
      console.log(`To: ${email}`);
      console.log(`Candidate: ${candidateName || "Unknown"}`);
      console.log(`Claim: ${claim}`);
      questions.forEach((q: { q: string; intent: string }, i: number) => {
        console.log(`Q${i + 1}: ${q.q}`);
      });
      return NextResponse.json({ success: true, demo: true });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Apex ATS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Skills Assessment${candidateName ? ` for ${candidateName}` : ""} — Apex ATS`,
      html: buildEmailHtml(candidateName, claim, questions),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send assessment error:", error);
    return NextResponse.json({ error: "Failed to send assessment" }, { status: 500 });
  }
}
