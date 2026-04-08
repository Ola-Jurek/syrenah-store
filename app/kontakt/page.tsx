"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Send, Mail, MapPin } from "lucide-react";

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Wypełnij wszystkie wymagane pola.");
      return;
    }

    if (formData.message.length < 10) {
      toast.error("Wiadomość musi zawierać co najmniej 10 znaków.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Wiadomość wysłana! Odpowiemy najszybciej jak to możliwe.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(data.error || "Wystąpił błąd podczas wysyłania.");
      }
    } catch {
      toast.error("Wystąpił błąd połączenia. Spróbuj ponownie później.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#FDFBF7",
            border: "1px solid #E8E3D8",
            color: "#1a1a1a",
            fontSize: "13px",
          },
        }}
      />

      {/* Header */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-4">
            Napisz do nas
          </p>
          <h1 className="font-playfair text-3xl md:text-4xl text-black tracking-wide">
            Kontakt
          </h1>
          <div className="w-12 h-px bg-black/20 mx-auto mt-6 mb-6" />
          <p className="text-sm text-black/55 max-w-lg mx-auto leading-relaxed">
            Masz pytanie dotyczące zamówienia, produktu lub współpracy?
            Chętnie pomożemy — wypełnij formularz, a odezwiemy się najszybciej jak to możliwe.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

            {/* Dane kontaktowe */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-6">
                  Informacje
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-black/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black mb-1">E-mail</p>
                      <a
                        href="mailto:info@syrenahthelabel.com"
                        className="text-sm text-black/55 hover:text-black transition"
                      >
                        info@syrenahthelabel.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-black/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black mb-1">Adres</p>
                      <p className="text-sm text-black/55 leading-relaxed">
                        Syrenah sp. z o.o.<br />
                        Ul. Słoneczna 42B/2<br />
                        55-311 Kostomłoty
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-black/10">
                <p className="text-xs text-black/40 leading-relaxed">
                  Odpowiadamy na wiadomości e-mail w ciągu 24 godzin w dni robocze.
                </p>
              </div>
            </div>

            {/* Formularz */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Imię i nazwisko */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-[11px] tracking-[0.15em] text-black/50 uppercase mb-2"
                    >
                      Imię i nazwisko <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E3D8] text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/30 transition-colors"
                      placeholder="Anna Kowalska"
                    />
                  </div>

                  {/* E-mail */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[11px] tracking-[0.15em] text-black/50 uppercase mb-2"
                    >
                      Adres e-mail <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E3D8] text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/30 transition-colors"
                      placeholder="anna@example.com"
                    />
                  </div>
                </div>

                {/* Temat */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-[11px] tracking-[0.15em] text-black/50 uppercase mb-2"
                  >
                    Temat
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E3D8] text-sm text-black focus:outline-none focus:border-black/30 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Wybierz temat...</option>
                    <option value="Pytanie o produkt">Pytanie o produkt</option>
                    <option value="Status zamówienia">Status zamówienia</option>
                    <option value="Zwrot lub wymiana">Zwrot lub wymiana</option>
                    <option value="Reklamacja">Reklamacja</option>
                    <option value="Współpraca">Współpraca</option>
                    <option value="Inne">Inne</option>
                  </select>
                </div>

                {/* Wiadomość */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-[11px] tracking-[0.15em] text-black/50 uppercase mb-2"
                  >
                    Wiadomość <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E3D8] text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/30 transition-colors resize-none"
                    placeholder="Opisz swoją sprawę..."
                  />
                </div>

                {/* Przycisk */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-10 py-3.5 bg-black text-white text-xs uppercase tracking-[0.2em] hover:bg-black/85 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" />
                        Wysyłanie...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Wyślij wiadomość
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
