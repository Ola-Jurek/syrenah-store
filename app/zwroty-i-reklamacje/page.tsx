import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zwroty i reklamacje",
  description: "Zasady zwrotów i reklamacji w sklepie Syrenah — 14 dni na zwrot bez podania przyczyny.",
};

export default function ZwrotyIReklamacjePage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-4">
            Dokumenty prawne
          </p>
          <h1 className="font-playfair text-3xl md:text-4xl text-black tracking-wide">
            Zwroty i Reklamacje
          </h1>
          <div className="w-12 h-px bg-black/20 mx-auto mt-6" />
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Intro */}
          <div className="mb-12 p-6 bg-[#FAF8F5] border border-[#E8E3D8]">
            <p className="text-sm text-black/70 leading-relaxed">
              W Syrenah zależy nam na Twoim pełnym zadowoleniu z zakupów. Jeśli zakupiony produkt
              nie spełnia Twoich oczekiwań, masz prawo go zwrócić lub zareklamować. Poniżej znajdziesz
              szczegółowe informacje dotyczące procedury zwrotów i reklamacji.
            </p>
          </div>

          {/* Zwroty */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                <span className="text-sm font-playfair text-black">I</span>
              </div>
              <h2 className="font-playfair text-xl text-black">Zwroty — prawo odstąpienia od umowy</h2>
            </div>

            <ol className="list-decimal list-inside space-y-4 text-sm text-black/70 leading-relaxed">
              <li>
                Zgodnie z ustawą z dnia 30 maja 2014 r. o prawach konsumenta, Konsument ma prawo
                odstąpić od umowy zawartej na odległość w terminie{" "}
                <span className="text-black font-medium">14 dni kalendarzowych</span> od dnia odebrania
                przesyłki, bez podawania przyczyny.
              </li>
              <li>
                Aby dokonać zwrotu, należy:
                <ul className="list-disc list-inside ml-4 mt-3 space-y-2">
                  <li>
                    Przesłać wypełniony formularz zwrotu na adres e-mail:{" "}
                    <span className="text-black">info@syrenahthelabel.com</span>, podając numer zamówienia.
                  </li>
                  <li>
                    Koniecznie zapakować produkt w oryginalne opakowanie (wraz z kompletem zawartości i metkami)
                    i odesłać przesyłkę na adres magazynu:{" "}
                    <span className="text-black font-medium">ul. Polna 22, 57-120 Wiązów</span>.
                  </li>
                </ul>
              </li>
              <li>
                <span className="text-black font-medium">Warunki zwrotu:</span> Produkt musi być nieużywany,
                w stanie nienaruszonym, z kompletnym opakowaniem i oryginalnymi metkami. Produkty noszące ślady
                użytkowania, uszkodzone z winy Klienta lub bez metek nie podlegają zwrotowi.
              </li>
              <li>
                Koszt odesłania produktu ponosi Klient, chyba że zwrot wynika z winy Sprzedawcy
                (np. wysłanie wadliwego lub niezgodnego z zamówieniem produktu).
              </li>
              <li>
                Zwrot płatności nastąpi w terminie{" "}
                <span className="text-black font-medium">14 dni</span> od dnia otrzymania formularza zwrotu,
                tą samą metodą płatności, której użył Klient przy składaniu zamówienia. Sprzedawca może
                wstrzymać się ze zwrotem płatności do czasu otrzymania zwracanego produktu.
              </li>
            </ol>
          </div>

          {/* Reklamacje */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                <span className="text-sm font-playfair text-black">II</span>
              </div>
              <h2 className="font-playfair text-xl text-black">Reklamacje</h2>
            </div>

            <ol className="list-decimal list-inside space-y-4 text-sm text-black/70 leading-relaxed">
              <li>
                Sprzedawca ponosi odpowiedzialność za wady fizyczne i prawne sprzedanego Produktu
                na zasadach określonych w Kodeksie cywilnym (rękojmia za wady).
              </li>
              <li>
                Reklamację można złożyć:
                <ul className="list-disc list-inside ml-4 mt-3 space-y-2">
                  <li>
                    wyłącznie drogą elektroniczną na adres:{" "}
                    <span className="text-black">info@syrenahthelabel.com</span>.
                  </li>
                </ul>
              </li>
              <li>
                <span className="text-black font-medium">Zgłoszenie reklamacyjne powinno zawierać:</span>
                <ul className="list-disc list-inside ml-4 mt-3 space-y-2">
                  <li>imię i nazwisko Klienta,</li>
                  <li>numer zamówienia,</li>
                  <li>opis stwierdzonej wady,</li>
                  <li>datę wykrycia wady,</li>
                  <li>żądanie Klienta (naprawa, wymiana, obniżenie ceny lub odstąpienie od umowy),</li>
                  <li>zdjęcia dokumentujące wadę (zalecane).</li>
                </ul>
              </li>
              <li>
                Reklamacja zostanie rozpatrzona w terminie{" "}
                <span className="text-black font-medium">14 dni kalendarzowych</span> od dnia jej otrzymania.
                O wyniku rozpatrzenia reklamacji Klient zostanie poinformowany drogą e-mailową.
              </li>
              <li>
                W przypadku uznania reklamacji, Sprzedawca — w zależności od żądania Klienta — naprawi
                lub wymieni Produkt na wolny od wad, obniży cenę lub zwróci pełną kwotę zakupu.
              </li>
              <li>
                Koszty przesyłki reklamowanego Produktu ponosi Sprzedawca w przypadku uznania reklamacji.
              </li>
            </ol>
          </div>

          {/* Wymiana */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                <span className="text-sm font-playfair text-black">III</span>
              </div>
              <h2 className="font-playfair text-xl text-black">Wymiana rozmiaru</h2>
            </div>

            <ol className="list-decimal list-inside space-y-4 text-sm text-black/70 leading-relaxed">
              <li>
                Jeśli zamówiony produkt nie pasuje rozmiarem, oferujemy możliwość jednorazowej wymiany
                na inny rozmiar (o ile jest dostępny w magazynie).
              </li>
              <li>
                Aby dokonać wymiany, skontaktuj się z nami pod adresem:{" "}
                <span className="text-black">info@syrenahthelabel.com</span>, podając numer zamówienia
                i pożądany rozmiar.
              </li>
              <li>
                Koszty przesyłki wymiany w obie strony ponosi Klient.
              </li>
              <li>
                Produkt przeznaczony do wymiany musi być w stanie nienaruszonym, z oryginalnymi metkami.
              </li>
            </ol>
          </div>

          {/* Formularz zwrotu / kontakt */}
          <div className="mb-12 p-8 bg-[#FAF8F5] border border-[#E8E3D8] text-center">
            <h3 className="font-playfair text-lg text-black mb-3">Formularz i kontakt</h3>
            <p className="text-sm text-black/60 mb-2">
              Adres magazynu do przesyłek zwrotnych:{" "}
              <span className="text-black font-medium">ul. Polna 22, 57-120 Wiązów</span>.
            </p>
            <p className="text-sm text-black/60 mb-6">
              W sprawach zwrotów i reklamacji kontakt jest możliwy wyłącznie drogą mailową na adres{" "}
              <span className="text-black">info@syrenahthelabel.com</span>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <span
                className="inline-block text-xs uppercase tracking-[0.2em] text-black/35 border border-black/15 px-8 py-3 cursor-default select-none"
                title="Plik zostanie udostępniony po publikacji"
              >
                Pobierz formularz zwrotu/reklamacji
              </span>
              <a
                href="/kontakt"
                className="inline-block text-xs uppercase tracking-[0.2em] text-black/60 border border-black/20 px-8 py-3 hover:bg-black hover:text-white transition-colors duration-300"
              >
                Formularz kontaktowy
              </a>
            </div>
            <p className="text-[11px] text-black/40 mt-4">
              Plik PDF formularza będzie dostępny wkrótce — tymczasowo prosimy o zgłoszenie na adres{" "}
              <span className="text-black/55">info@syrenahthelabel.com</span>.
            </p>
          </div>

          {/* Data */}
          <div className="pt-8 border-t border-black/10">
            <p className="text-xs text-black/40 tracking-wide">
              Ostatnia aktualizacja: Kwiecień 2026
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
