import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description: "Polityka prywatności sklepu Syrenah — informacje o przetwarzaniu danych osobowych zgodnie z RODO.",
};

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-4">
            Dokumenty prawne
          </p>
          <h1 className="font-playfair text-3xl md:text-4xl text-black tracking-wide">
            Polityka Prywatności
          </h1>
          <div className="w-12 h-px bg-black/20 mx-auto mt-6" />
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Wstęp */}
          <div className="mb-12">
            <p className="text-sm text-black/70 leading-relaxed">
              Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych
              Klientów sklepu internetowego Syrenah, dostępnego pod adresem{" "}
              <span className="text-black">www.syrenahthelabel.com</span>. Dbamy o prywatność naszych Klientów
              i dokładamy wszelkich starań, aby dane osobowe były przetwarzane zgodnie z obowiązującymi
              przepisami prawa, w szczególności z Rozporządzeniem Parlamentu Europejskiego i Rady (UE)
              2016/679 z dnia 27 kwietnia 2016 r. (RODO).
            </p>
          </div>

          {/* §1 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">I. Administrator danych osobowych</h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>
                Administratorem danych osobowych jest <span className="text-black font-medium">[Nazwa firmy Sp. z o.o.]</span>,
                z siedzibą w <span className="text-black font-medium">[adres siedziby]</span>,
                NIP: <span className="text-black font-medium">[numer NIP]</span>,
                REGON: <span className="text-black font-medium">[numer REGON]</span> (dalej: „Administrator").
              </li>
              <li>
                Kontakt z Administratorem w sprawach dotyczących danych osobowych jest możliwy pod adresem e-mail:{" "}
                <span className="text-black">contact@syrenah.com</span>.
              </li>
            </ol>
          </div>

          {/* §2 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">II. Cele i podstawy przetwarzania danych</h2>
            <p className="text-sm text-black/70 leading-relaxed mb-4">
              Dane osobowe Klientów przetwarzane są w następujących celach:
            </p>
            <ul className="space-y-4 text-sm text-black/70 leading-relaxed">
              <li className="pl-4 border-l-2 border-black/10">
                <span className="text-black font-medium">Realizacja zamówień</span> — przetwarzanie danych jest niezbędne
                do wykonania umowy sprzedaży (art. 6 ust. 1 lit. b RODO). Obejmuje to imię, nazwisko, adres dostawy,
                adres e-mail, numer telefonu oraz dane do faktury.
              </li>
              <li className="pl-4 border-l-2 border-black/10">
                <span className="text-black font-medium">Prowadzenie Konta Klienta</span> — na podstawie zgody Klienta
                (art. 6 ust. 1 lit. a RODO). Klient może w dowolnym momencie usunąć swoje konto.
              </li>
              <li className="pl-4 border-l-2 border-black/10">
                <span className="text-black font-medium">Marketing bezpośredni</span> — w zakresie newslettera, na podstawie
                dobrowolnej zgody Klienta (art. 6 ust. 1 lit. a RODO). Zgoda może być wycofana w dowolnym momencie.
              </li>
              <li className="pl-4 border-l-2 border-black/10">
                <span className="text-black font-medium">Obsługa zapytań i reklamacji</span> — w celu realizacji prawnie
                uzasadnionego interesu Administratora (art. 6 ust. 1 lit. f RODO).
              </li>
              <li className="pl-4 border-l-2 border-black/10">
                <span className="text-black font-medium">Obowiązki prawne</span> — w zakresie wymaganym przepisami prawa,
                w szczególności prawa podatkowego i rachunkowego (art. 6 ust. 1 lit. c RODO).
              </li>
            </ul>
          </div>

          {/* §3 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">III. Okres przechowywania danych</h2>
            <ul className="list-disc list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>Dane związane z realizacją zamówień przechowywane są przez okres wymagany przepisami prawa podatkowego (5 lat od końca roku podatkowego).</li>
              <li>Dane Konta Klienta przechowywane są do momentu usunięcia konta przez Klienta.</li>
              <li>Dane przetwarzane na podstawie zgody — do momentu jej wycofania.</li>
              <li>Dane dotyczące reklamacji — przez okres niezbędny do rozpatrzenia reklamacji oraz ewentualnego dochodzenia roszczeń.</li>
            </ul>
          </div>

          {/* §4 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">IV. Prawa osób, których dane dotyczą</h2>
            <p className="text-sm text-black/70 leading-relaxed mb-4">
              Każdemu Klientowi przysługuje prawo do:
            </p>
            <ul className="list-disc list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>dostępu do swoich danych osobowych,</li>
              <li>sprostowania (poprawienia) danych,</li>
              <li>usunięcia danych („prawo do bycia zapomnianym"),</li>
              <li>ograniczenia przetwarzania danych,</li>
              <li>przenoszenia danych do innego administratora,</li>
              <li>wniesienia sprzeciwu wobec przetwarzania danych,</li>
              <li>cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania dokonanego przed cofnięciem zgody),</li>
              <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).</li>
            </ul>
          </div>

          {/* §5 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">V. Odbiorcy danych</h2>
            <p className="text-sm text-black/70 leading-relaxed mb-4">
              Dane osobowe mogą być przekazywane następującym kategoriom odbiorców:
            </p>
            <ul className="list-disc list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>firmom kurierskim i operatorom logistycznym (DPD, InPost) — w celu dostawy zamówień,</li>
              <li>operatorowi płatności (Stripe) — w celu obsługi transakcji płatniczych,</li>
              <li>dostawcy usług hostingowych i infrastruktury IT,</li>
              <li>dostawcy usług e-mail transakcyjnych (Resend),</li>
              <li>podmiotom uprawnionym na podstawie przepisów prawa.</li>
            </ul>
          </div>

          {/* §6 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">VI. Pliki cookies</h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>Sklep korzysta z plików cookies (ciasteczek) w celu zapewnienia prawidłowego działania strony, analizy ruchu oraz personalizacji treści.</li>
              <li>
                Rodzaje wykorzystywanych plików cookies:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><span className="text-black font-medium">Niezbędne</span> — wymagane do prawidłowego działania Sklepu (sesja, koszyk, uwierzytelnianie).</li>
                  <li><span className="text-black font-medium">Analityczne</span> — pomagają zrozumieć, w jaki sposób Klienci korzystają ze Sklepu.</li>
                  <li><span className="text-black font-medium">Marketingowe</span> — wykorzystywane do wyświetlania spersonalizowanych treści reklamowych.</li>
                </ul>
              </li>
              <li>Klient może w dowolnym momencie zmienić ustawienia plików cookies w swojej przeglądarce internetowej, w tym zablokować ich zapisywanie.</li>
            </ol>
          </div>

          {/* §7 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">VII. Bezpieczeństwo danych</h2>
            <p className="text-sm text-black/70 leading-relaxed">
              Administrator stosuje odpowiednie środki techniczne i organizacyjne zapewniające ochronę
              przetwarzanych danych osobowych, w szczególności zabezpiecza dane przed ich udostępnieniem
              osobom nieupoważnionym, utratą, uszkodzeniem lub zniszczeniem. Komunikacja ze Sklepem jest
              szyfrowana za pomocą protokołu SSL/TLS. Dane płatnicze są przetwarzane wyłącznie przez
              certyfikowanego operatora płatności (Stripe) i nie są przechowywane na serwerach Sklepu.
            </p>
          </div>

          {/* §8 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">VIII. Zmiany Polityki Prywatności</h2>
            <p className="text-sm text-black/70 leading-relaxed">
              Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności.
              O wszelkich zmianach Klienci zostaną poinformowani poprzez publikację zaktualizowanej wersji
              na stronie Sklepu. Korzystanie ze Sklepu po wprowadzeniu zmian oznacza ich akceptację.
            </p>
          </div>

          {/* Data */}
          <div className="pt-8 border-t border-black/10">
            <p className="text-xs text-black/40 tracking-wide">
              Ostatnia aktualizacja: Luty 2026
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
