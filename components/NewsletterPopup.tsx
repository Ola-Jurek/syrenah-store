"use client";

import { useState, useEffect } from "react";
import { areCookiesAccepted } from "@/components/CookieBanner";

export function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Sprawdź czy popup już był pokazany w tej sesji
    const wasShown = sessionStorage.getItem("syrenah_newsletter_shown");
    if (wasShown) return;

    /** Pokaż popup po 5 s — ale dopiero gdy cookies są zaakceptowane */
    const tryShow = () => {
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem("syrenah_newsletter_shown", "true");
      }, 5000);
      return timer;
    };

    // Jeśli cookies już zaakceptowane — odliczaj od razu
    if (areCookiesAccepted()) {
      const timer = tryShow();
      return () => clearTimeout(timer);
    }

    // W przeciwnym razie — czekaj na event akceptacji cookies
    let timer: ReturnType<typeof setTimeout> | null = null;

    const onCookiesAccepted = () => {
      timer = tryShow();
    };

    window.addEventListener("cookies-accepted", onCookiesAccepted);

    return () => {
      window.removeEventListener("cookies-accepted", onCookiesAccepted);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consent) {
      setStatus("error");
      setMessage("Zaznacz zgodę na przetwarzanie danych.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.error || "Wystąpił błąd.");
      }
    } catch {
      setStatus("error");
      setMessage("Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsVisible(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
        <div className="relative bg-[#FDFBF7] border border-[#E8E3D8] shadow-2xl w-full max-w-md p-8 sm:p-10">
          {/* Zamknij */}
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {status === "success" ? (
            /* Stan sukcesu */
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#C1A88C]/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#C1A88C]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-neutral-800 mb-2">
                Dziękujemy!
              </h3>
              <p className="text-sm text-neutral-500">{message}</p>
              <button
                onClick={() => setIsVisible(false)}
                className="mt-6 text-xs text-[#C1A88C] hover:text-[#B09A7C] underline underline-offset-2 transition-colors"
              >
                Zamknij
              </button>
            </div>
          ) : (
            /* Formularz */
            <>
              {/* Dekoracyjna linia */}
              <div className="w-8 h-px bg-[#C1A88C] mx-auto mb-6" />

              <h2 className="font-serif text-xl text-neutral-800 text-center mb-3">
                Bądź częścią naszej historii
              </h2>
              <p className="text-sm text-neutral-500 text-center leading-relaxed mb-8">
                Zapisz się do newslettera, by otrzymywać informacje o nowych
                kolekcjach i wyjątkowych ofertach.
                <br />
                <span className="text-[#C1A88C]">
                  Dołącz do Syrenah Girls 🤍
                </span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Twój adres e-mail"
                  required
                  className="w-full px-4 py-3 text-sm border border-[#E8E3D8] bg-white text-neutral-700 placeholder:text-neutral-300 focus:outline-none focus:border-[#C1A88C] transition-colors"
                />

                {/* Checkbox zgody */}
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <span
                    onClick={() => setConsent(!consent)}
                    className={`relative w-4 h-4 mt-0.5 border-2 rounded-sm flex items-center justify-center transition-colors flex-shrink-0 ${
                      consent
                        ? "bg-[#C1A88C] border-[#C1A88C]"
                        : "border-neutral-300 bg-white group-hover:border-[#C1A88C]/60"
                    }`}
                  >
                    {consent && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className="text-xs text-neutral-500 leading-relaxed"
                    onClick={() => setConsent(!consent)}
                  >
                    Wyrażam zgodę na przetwarzanie moich danych osobowych w celu
                    otrzymywania newslettera.
                  </span>
                </label>

                {/* Komunikat błędu */}
                {status === "error" && message && (
                  <p className="text-xs text-red-400 text-center">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-[#C1A88C] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#B09A7C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                      Zapisywanie...
                    </span>
                  ) : (
                    "Zapisz się"
                  )}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="block mx-auto mt-4 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                Nie, dziękuję
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
