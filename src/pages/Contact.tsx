import React from "react";
import Meta from "../components/Meta";
import { hashLink } from "../lib/routes";

export default function Contact() {
  return (
    <>
      <Meta
        title="Contact — The Hippie Scientist"
        description="Questions, corrections, partnerships—drop us a line."
        path="/contact"
        pageType="website"
      />
      <main className="container mx-auto max-w-2xl space-y-6 px-4 py-10">
        <header className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
          <h1 className="bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent">
            Contact
          </h1>
          <p className="mt-2 text-white/75">
            We read every message. Safety notes and factual corrections are appreciated.
          </p>
        </header>

        <form
          name="contact"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          action="/thank-you"
          className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
          onSubmit={() => {
            try {
              (window as any).gtag?.("event", "contact_submit");
            } catch {
              /* noop */
            }
          }}
        >
          <input type="hidden" name="form-name" value="contact" />
          <p className="hidden">
            <label>
              Don’t fill this out: <input name="bot-field" />
            </label>
          </p>

          <label className="block">
            <span className="text-sm text-white/80">Name</span>
            <input
              required
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Will"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 placeholder-white/50"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Email</span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 placeholder-white/50"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Subject</span>
            <input
              required
              type="text"
              name="subject"
              placeholder="Partnership inquiry"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 placeholder-white/50"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Message</span>
            <textarea
              required
              name="message"
              rows={6}
              placeholder="How can we help?"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 placeholder-white/50"
            />
          </label>

          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-lime-300/20 bg-gradient-to-r from-lime-400/30 to-cyan-400/20 px-4 py-2 text-sm font-medium text-lime-200 hover:from-lime-400/40 hover:to-cyan-400/30">
              Send message
            </button>
            <a className="text-white/70 underline hover:text-cyan-300" href="mailto:hello@thehippiescientist.net">
              or email us directly
            </a>
          </div>

          <p className="text-xs text-white/60">
            This form is protected by a spam honeypot. By submitting, you agree to our {" "}
            <a className="underline" href={hashLink("/privacy")}>
              Privacy Policy
            </a>{" "}
            and {" "}
            <a className="underline" href={hashLink("/disclaimer")}>
              Disclaimer
            </a>
            .
          </p>
        </form>
      </main>
    </>
  );
}
