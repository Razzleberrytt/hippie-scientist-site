import React, { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Meta from "../components/Meta";

function encodeForm(data: FormData) {
  const params = new URLSearchParams();
  data.forEach((value, key) => {
    params.append(key, value.toString());
  });
  return params.toString();
}

export default function Newsletter() {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (sent) {
      try {
        (window as any).gtag?.("event", "newsletter_signup_success");
      } catch {
        /* noop */
      }
    }
  }, [sent]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("form-name", "newsletter");

    try {
      (window as any).gtag?.("event", "newsletter_signup_submit", { method: "netlify" });
    } catch {
      /* noop */
    }

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeForm(formData),
    }).catch(() => {
      /* Netlify will still capture submission on navigation fallback */
    });

    setSent(true);
    form.reset();
  };

  return (
    <>
      <Meta
        title="Newsletter — The Hippie Scientist"
        description="Get new herb profiles, safety notes, and blend ideas in your inbox."
        path="/newsletter"
        pageType="website"
      />
      <main className="container mx-auto max-w-2xl space-y-6 px-4 py-10">
        <header className="glass-soft rounded-2xl p-6">
          <h1 className="bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent">
            Join the newsletter
          </h1>
          <p className="mt-2 text-white/75">
            Occasional updates: new herb pages, safety advisories, and research roundups. No spam.
          </p>
        </header>

        {!sent ? (
          <form
            name="newsletter"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            className="glass-soft space-y-4 rounded-2xl p-6"
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="form-name" value="newsletter" />
            <p className="hidden">
              <label>
                Don’t fill this out: <input name="bot-field" />
              </label>
            </p>

            <label className="block">
              <span className="text-sm text-white/80">Email address</span>
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/16 px-3 py-2 placeholder-white/50 backdrop-blur"
              />
            </label>

            <label className="block">
              <span className="text-sm text-white/80">First name (optional)</span>
              <input
                type="text"
                name="firstName"
                autoComplete="given-name"
                placeholder="Will"
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/16 px-3 py-2 placeholder-white/50 backdrop-blur"
              />
            </label>

            <button className="rounded-lg border border-lime-300/20 bg-gradient-to-r from-lime-400/30 to-cyan-400/20 px-4 py-2 text-sm font-medium text-lime-200 hover:from-lime-400/40 hover:to-cyan-400/30">
              Subscribe
            </button>

            <p className="pt-2 text-xs text-white/60">
              By subscribing, you agree to our
              {" "}
              <Link className="underline" to="/privacy">
                Privacy Policy
              </Link>
              {" "}
              and
              {" "}
              <Link className="underline" to="/disclaimer">
                Disclaimer
              </Link>
              .
            </p>

            <p className="text-xs text-white/50">
              Not using Netlify? Email us instead: <a className="underline" href="mailto:hello@thehippiescientist.net?subject=Newsletter%20Signup">hello@thehippiescientist.net</a>
            </p>
          </form>
        ) : (
          <div className="glass-soft rounded-2xl p-6">
            <h2 className="font-semibold text-lime-300">You're on the list ✦</h2>
            <p className="mt-1 text-white/75">Check your inbox for a confirmation. Welcome aboard.</p>
            <nav className="mt-4 text-sm">
              <Link className="mr-3 underline" to="/herbs">
                Browse database
              </Link>
              <Link className="underline" to="/blog">
                Read the blog
              </Link>
            </nav>
          </div>
        )}
      </main>
    </>
  );
}
