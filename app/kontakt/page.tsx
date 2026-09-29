"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Send, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function KontaktPage() {
  const { messages } = useLanguage();
  const c = messages.contact;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error(c.toastFillRequired);
      return;
    }

    if (formData.message.length < 10) {
      toast.error(c.toastMessageShort);
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
        toast.success(c.toastSuccess);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(data.error || c.toastError);
      }
    } catch {
      toast.error(c.toastNetwork);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addressLines = c.addressLines.split("\n");

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

      <section className="pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-4">
            {c.kicker}
          </p>
          <h1 className="font-playfair text-3xl md:text-4xl text-black tracking-wide">
            {c.title}
          </h1>
          <div className="w-12 h-px bg-black/20 mx-auto mt-6 mb-6" />
          <p className="text-sm text-black/55 max-w-lg mx-auto leading-relaxed">
            {c.intro}
          </p>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-1 space-y-8">
              <div>
                <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-6">
                  {c.infoKicker}
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-black/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black mb-1">
                        {c.emailLabel}
                      </p>
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
                      <p className="text-sm font-medium text-black mb-1">
                        {c.addressLabel}
                      </p>
                      <p className="text-sm text-black/55 leading-relaxed">
                        {addressLines.map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < addressLines.length - 1 ? <br /> : null}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-black/10">
                <p className="text-xs text-black/40 leading-relaxed">
                  {c.responseNote}
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-[11px] tracking-[0.15em] text-black/50 uppercase mb-2"
                    >
                      {c.nameLabel}{" "}
                      <span className="text-red-400">*</span>
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

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[11px] tracking-[0.15em] text-black/50 uppercase mb-2"
                    >
                      {c.emailFieldLabel}{" "}
                      <span className="text-red-400">*</span>
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

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-[11px] tracking-[0.15em] text-black/50 uppercase mb-2"
                  >
                    {c.subjectLabel}
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E3D8] text-sm text-black focus:outline-none focus:border-black/30 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">{c.subjectPlaceholder}</option>
                    <option value="Pytanie o produkt">{c.subjectProduct}</option>
                    <option value="Status zamówienia">{c.subjectOrder}</option>
                    <option value="Zwrot lub wymiana">{c.subjectReturn}</option>
                    <option value="Reklamacja">{c.subjectComplaint}</option>
                    <option value="Współpraca">{c.subjectCoop}</option>
                    <option value="Inne">{c.subjectOther}</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-[11px] tracking-[0.15em] text-black/50 uppercase mb-2"
                  >
                    {c.messageLabel}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E3D8] text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/30 transition-colors resize-none"
                    placeholder={c.messagePlaceholder}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-10 py-3.5 bg-black text-white text-xs uppercase tracking-[0.2em] hover:bg-black/85 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" />
                        {c.submitting}
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        {c.submit}
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
