import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "O nas",
  description: "Syrenah — luksusowa moda damska tworzona z pasją. Poznaj historię naszej marki.",
};

export default function ONasPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Hero Section - duże zdjęcie z overlay */}
      <section className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden">
        {/* Placeholder na zdjęcie — zamień src na właściwe zdjęcie marki */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8E0D4] via-[#D4C8B8] to-[#C1B5A5]">
          {/* 
            Aby dodać zdjęcie, odkomentuj poniższy komponent Image i podaj właściwe src:
            <Image
              src="/images/about-hero.jpg"
              alt="Syrenah — luksusowa moda damska"
              fill
              className="object-cover"
              priority
            />
          */}
        </div>

        {/* Overlay z tekstem */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center px-6 max-w-2xl">
            <p className="text-[11px] tracking-[0.4em] text-white/70 uppercase mb-4">
              Nasza historia
            </p>
            <h1 className="font-playfair text-4xl md:text-6xl text-white tracking-wide leading-tight">
              Syrenah
            </h1>
            <div className="w-16 h-px bg-white/40 mx-auto mt-6 mb-6" />
            <p className="text-sm md:text-base text-white/80 tracking-wide font-light">
              Elegancja zrodzona z pasji. Moda, która podkreśla Twoją wyjątkowość.
            </p>
          </div>
        </div>
      </section>

      {/* Sekcja: Misja */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-6">
            Kim jesteśmy
          </p>
          <div className="w-12 h-px bg-black/20 mx-auto mb-8" />
          <p className="text-sm md:text-base text-black/60 leading-[1.9] tracking-wide">
            Tworzymy modę dla kobiet, które wiedzą czego chcą. Jesteśmy siostrami – Marta i Claudia. Razem
            stworzyłyśmy Syrenah od zera. Zaczynając od samego początku, z ogromną determinacją uczymy się,
            projektujemy i budujemy tę markę krok po kroku. Wierzymy, że kiedy ma się odwagę próbować, nie ma
            rzeczy, których nie da się osiągnąć.
          </p>
        </div>
      </section>

      {/* Sekcja: Wartości - 3 kolumny */}
      <section className="py-16 px-6 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-12 text-center">
            Nasze wartości
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {/* Wartość 1 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-6 border border-black/10 rounded-full flex items-center justify-center">
                <span className="font-playfair text-lg text-black/70">01</span>
              </div>
              <h3 className="font-playfair text-lg text-black mb-3">Kunszt i jakość</h3>
              <p className="text-sm text-black/55 leading-relaxed">
                Dbamy o jakość, detale i najwyższy poziom obsługi. Syrenah to marka, która daje kobietom
                możliwość poczucia się wyjątkowo — bez kompromisów.
              </p>
            </div>

            {/* Wartość 2 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-6 border border-black/10 rounded-full flex items-center justify-center">
                <span className="font-playfair text-lg text-black/70">02</span>
              </div>
              <h3 className="font-playfair text-lg text-black mb-3">Pewność siebie</h3>
              <p className="text-sm text-black/55 leading-relaxed">
                Nasza marka powstała z myślą o każdej kobiecie. Wierzymy, że styl i piękno nie mają jednego
                rozmiaru, koloru ani definicji. Chcemy, aby każda kobieta – niezależnie od sylwetki, koloru skóry
                czy wieku – mogła poczuć się w naszych projektach pewnie i wyjątkowo.
              </p>
            </div>

            {/* Wartość 3 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-6 border border-black/10 rounded-full flex items-center justify-center">
                <span className="font-playfair text-lg text-black/70">03</span>
              </div>
              <h3 className="font-playfair text-lg text-black mb-3">Symbolika syreny</h3>
              <p className="text-sm text-black/55 leading-relaxed">
                Syrena jest symbolem kobiecej niezależności, siły i odwagi. To kobieta, która podąża własną
                drogą, słucha swojej intuicji i nie boi się być sobą.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sekcja: Manifest */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-6">
            Manifest
          </p>
          <blockquote className="font-playfair text-xl md:text-2xl text-black/80 leading-relaxed italic mb-8">
            &ldquo;Syrenah to manifest kobiecej siły. Wierzymy, że każda kobieta ma w sobie odwagę, by sięgać po
            więcej. Bo kiedy wierzysz w siebie, nie ma rzeczy niemożliwych.&rdquo;
          </blockquote>
          <div className="w-12 h-px bg-black/20 mx-auto mb-6" />
          <p className="text-xs tracking-[0.2em] text-black/40 uppercase">
            Zespół Syrenah
          </p>
        </div>
      </section>

      {/* Sekcja: Duże zdjęcie (placeholder) */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4C8B8] via-[#C8BAA8] to-[#BCA898]">
          {/* 
            Zamień na właściwe zdjęcie:
            <Image
              src="/images/about-bottom.jpg"
              alt="Kolekcja Syrenah"
              fill
              className="object-cover"
            />
          */}
        </div>
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-center px-6">
            <p className="font-playfair text-2xl md:text-4xl text-white tracking-wide">
              Odkryj kolekcję
            </p>
            <a
              href="/shop"
              className="inline-block mt-8 text-xs uppercase tracking-[0.2em] text-white/80 border border-white/40 px-8 py-3 hover:bg-white hover:text-black transition-colors duration-300"
            >
              Zobacz sklep
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
