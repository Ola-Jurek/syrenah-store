import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulamin sklepu",
  description: "Regulamin sklepu internetowego Syrenah — warunki zakupów, płatności i realizacji zamówień.",
};

export default function RegulaminPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-4">
            Dokumenty prawne
          </p>
          <h1 className="font-playfair text-3xl md:text-4xl text-black tracking-wide">
            Regulamin Sklepu
          </h1>
          <div className="w-12 h-px bg-black/20 mx-auto mt-6" />
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto prose-container">

          {/* §1 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">§ 1. Postanowienia ogólne</h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>
                Niniejszy Regulamin określa zasady korzystania ze sklepu internetowego Syrenah, dostępnego pod adresem{" "}
                <span className="text-black">www.syrenah.com</span> (dalej: „Sklep").
              </li>
              <li>
                Właścicielem i operatorem Sklepu jest <span className="text-black font-medium">[Nazwa firmy Sp. z o.o.]</span>,
                z siedzibą w <span className="text-black font-medium">[adres siedziby]</span>,
                wpisana do rejestru przedsiębiorców prowadzonego przez Sąd Rejonowy w <span className="text-black font-medium">[miasto]</span>,
                pod numerem KRS: <span className="text-black font-medium">[numer KRS]</span>,
                NIP: <span className="text-black font-medium">[numer NIP]</span>,
                REGON: <span className="text-black font-medium">[numer REGON]</span>.
              </li>
              <li>
                Kontakt ze Sklepem możliwy jest pod adresem e-mail: <span className="text-black">contact@syrenah.com</span> lub telefonicznie pod numerem: <span className="text-black font-medium">[numer telefonu]</span>.
              </li>
              <li>
                Korzystanie ze Sklepu oznacza akceptację niniejszego Regulaminu.
              </li>
              <li>
                Regulamin jest udostępniany nieodpłatnie za pośrednictwem Sklepu w formie umożliwiającej jego pobranie, utrwalenie i wydrukowanie.
              </li>
            </ol>
          </div>

          {/* §2 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">§ 2. Definicje</h2>
            <ul className="list-disc list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li><span className="text-black font-medium">Klient</span> — osoba fizyczna posiadająca pełną zdolność do czynności prawnych, osoba prawna lub jednostka organizacyjna, która dokonuje lub zamierza dokonać zakupu w Sklepie.</li>
              <li><span className="text-black font-medium">Konsument</span> — Klient będący osobą fizyczną dokonującą ze Sprzedawcą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.</li>
              <li><span className="text-black font-medium">Produkt</span> — rzecz ruchoma dostępna w ofercie Sklepu, będąca przedmiotem umowy sprzedaży.</li>
              <li><span className="text-black font-medium">Zamówienie</span> — oświadczenie woli Klienta zmierzające do zawarcia umowy sprzedaży Produktu ze Sprzedawcą.</li>
              <li><span className="text-black font-medium">Konto</span> — indywidualne konto Klienta w Sklepie, umożliwiające korzystanie z dodatkowych funkcjonalności.</li>
            </ul>
          </div>

          {/* §3 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">§ 3. Zasady składania zamówień</h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>Zamówienia można składać 24 godziny na dobę, 7 dni w tygodniu za pośrednictwem strony internetowej Sklepu.</li>
              <li>Złożenie zamówienia wymaga: wyboru Produktu, dodania go do koszyka, podania danych do wysyłki, wyboru metody dostawy oraz dokonania płatności.</li>
              <li>Zamówienia mogą być składane zarówno przez Klientów posiadających Konto, jak i bez rejestracji (jako gość).</li>
              <li>Po złożeniu zamówienia Klient otrzymuje na podany adres e-mail potwierdzenie przyjęcia zamówienia wraz z jego numerem.</li>
              <li>Umowa sprzedaży zostaje zawarta z chwilą potwierdzenia zamówienia przez Sprzedawcę.</li>
              <li>Sprzedawca zastrzega sobie prawo do odmowy realizacji zamówienia w przypadku podania nieprawdziwych lub niekompletnych danych przez Klienta.</li>
            </ol>
          </div>

          {/* §4 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">§ 4. Ceny i płatności</h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>Wszystkie ceny podane w Sklepie wyrażone są w złotych polskich (PLN) i zawierają podatek VAT.</li>
              <li>Cena Produktu podana w chwili składania zamówienia jest wiążąca dla obu stron.</li>
              <li>
                Sklep umożliwia dokonanie płatności za pośrednictwem:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>systemu płatności online Stripe (karty płatnicze, BLIK, przelewy bankowe),</li>
                  <li>innych metod płatności udostępnionych w procesie składania zamówienia.</li>
                </ul>
              </li>
              <li>Koszty dostawy są doliczane do ceny zamówienia i prezentowane Klientowi przed finalizacją zakupu.</li>
            </ol>
          </div>

          {/* §5 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">§ 5. Dostawa</h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>Dostawa Produktów odbywa się na terytorium Rzeczypospolitej Polskiej.</li>
              <li>
                Sklep realizuje dostawy za pośrednictwem:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Kurier DPD,</li>
                  <li>Paczkomat InPost,</li>
                  <li>Kurier InPost.</li>
                </ul>
              </li>
              <li>Przewidywany czas dostawy wynosi od 2 do 5 dni roboczych od momentu zaksięgowania płatności.</li>
              <li>Klient jest informowany o statusie przesyłki drogą e-mailową, w tym o nadaniu numeru przesyłki.</li>
            </ol>
          </div>

          {/* §6 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">§ 6. Prawo odstąpienia od umowy</h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>
                Konsument ma prawo odstąpić od umowy zawartej na odległość w terminie{" "}
                <span className="text-black font-medium">14 dni kalendarzowych</span> bez podawania przyczyny i bez ponoszenia kosztów, z wyjątkiem kosztów określonych w pkt. 5 poniżej.
              </li>
              <li>Bieg terminu do odstąpienia od umowy rozpoczyna się od dnia, w którym Konsument objął Produkt w posiadanie lub w którym wskazana przez niego osoba trzecia inna niż przewoźnik objęła Produkt w posiadanie.</li>
              <li>Aby skorzystać z prawa odstąpienia od umowy, Konsument powinien poinformować Sprzedawcę o swojej decyzji w drodze jednoznacznego oświadczenia, przesłanego na adres e-mail: <span className="text-black">contact@syrenah.com</span>.</li>
              <li>Sprzedawca niezwłocznie, nie później niż w terminie 14 dni od dnia otrzymania oświadczenia o odstąpieniu, zwróci Konsumentowi wszystkie dokonane przez niego płatności, w tym koszty dostawy (z wyjątkiem dodatkowych kosztów wynikających z wybranego przez Konsumenta sposobu dostawy innego niż najtańszy).</li>
              <li>Konsument ponosi bezpośrednie koszty zwrotu Produktu.</li>
              <li>Produkt powinien zostać zwrócony w stanie niezmienionym, bez śladów użytkowania, z kompletnym opakowaniem i metkami.</li>
            </ol>
          </div>

          {/* §7 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">§ 7. Reklamacje</h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>Sprzedawca jest zobowiązany dostarczyć Klientowi Produkt wolny od wad.</li>
              <li>Reklamacje można składać drogą elektroniczną na adres: <span className="text-black">contact@syrenah.com</span> lub pisemnie na adres siedziby Sprzedawcy.</li>
              <li>Reklamacja powinna zawierać: opis wady, datę jej stwierdzenia, żądanie Klienta (naprawa, wymiana, obniżenie ceny lub odstąpienie od umowy) oraz dowód zakupu.</li>
              <li>Sprzedawca rozpatrzy reklamację w terminie 14 dni kalendarzowych od dnia jej otrzymania i poinformuje Klienta o sposobie jej rozpatrzenia.</li>
            </ol>
          </div>

          {/* §8 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">§ 8. Ochrona danych osobowych</h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>Administratorem danych osobowych Klientów jest Sprzedawca.</li>
              <li>Dane osobowe przetwarzane są zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) oraz ustawą o ochronie danych osobowych.</li>
              <li>Szczegółowe informacje dotyczące przetwarzania danych osobowych zawarte są w Polityce Prywatności dostępnej na stronie Sklepu.</li>
            </ol>
          </div>

          {/* §9 */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">§ 9. Postanowienia końcowe</h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed">
              <li>Sprzedawca zastrzega sobie prawo do zmiany niniejszego Regulaminu. O każdej zmianie Klienci zostaną poinformowani poprzez publikację nowej wersji Regulaminu na stronie Sklepu.</li>
              <li>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz ustawy o prawach konsumenta.</li>
              <li>Wszelkie spory wynikłe z umów zawartych na podstawie niniejszego Regulaminu będą rozstrzygane przez sąd właściwy dla siedziby Sprzedawcy, z zastrzeżeniem, że w przypadku Konsumenta — sąd właściwy miejscowo zgodnie z przepisami Kodeksu postępowania cywilnego.</li>
              <li>Regulamin wchodzi w życie z dniem publikacji na stronie Sklepu.</li>
            </ol>
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
