import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const pl = {
  nav: {
    home: "START",
    shop: "SKLEP",
    about: "O NAS",
    contact: "KONTAKT",
    collections: "KOLEKCJE",
    searchPlaceholder: "SZUKAJ...",
    categories: "KATEGORIE",
    login: "Zaloguj",
    myAccount: "Moje konto",
    mobileMenuTitle: "Menu główne",
    openMenu: "Otwórz menu",
    wishlistAria: "Ulubione",
    cartAria: "Koszyk",
    accountAria: "Konto",
  },
  footer: {
    info: "Informacje",
    about: "O nas",
    contact: "Kontakt",
    terms: "Regulamin",
    privacy: "Polityka prywatności",
    returns: "Zwroty i reklamacje",
    social: "Social",
    shopData: "Dane sklepu",
    copyright: "Wszystkie prawa zastrzeżone.",
  },
  home: {
    newest: "NOWO\u015ACI",
    seeAll: "Zobacz wszystkie",
  },
  instagram: {
    title: "INSTAGRAM",
  },
  shop: {
    codePrefix: "KOD:",
    preparing: "Produkty w przygotowaniu \u2728",
    searchTitle: "WYNIKI WYSZUKIWANIA:",
    foundOne: "Znaleziono",
    product: "produkt",
    products: "produktów",
    noResults: "Nie znaleziono produktów dla frazy",
    filterAll: "WSZYSTKIE",
    filterNew: "NOWO\u015ACI",
    filterSale: "WYPRZEDA\u017B",
    sortNewest: "Najnowsze",
    sortPriceAsc: "Od najniższej",
    sortPriceDesc: "Od najwyższej",
    sortPriceLabel: "Cena",
  },
  product: {
    shopCrumb: "SKLEP",
    size: "Rozmiar",
    color: "Kolor",
    addToCart: "Dodaj do koszyka",
    outOfStock: "Niedostępny",
    selectSize: "Wybierz rozmiar",
  },
  sizeChart: {
    trigger: "Tabela wymiarów",
    title: "Tabela wymiarów",
    subtitle: "wymiary w cm",
    srDescription:
      "Długość, biodra, klatka piersiowa i talia tego produktu w centymetrach.",
    colSize: "Rozmiar",
    colLength: "Długość",
    colHips: "Biodra",
    colChest: "Klatka",
    colWaist: "Talia",
    caption: "Tabela rozmiarów, wymiary w centymetrach",
    footnote: "Wymiary tego produktu w centymetrach.",
    unitCm: "cm",
    unitIn: "in",
    subtitleIn: "wymiary w calach",
    captionIn: "Tabela rozmiarów, wymiary w calach",
    footnoteIn: "Wymiary przeliczone z centymetrów. 1 cal = 2,54 cm.",
    srDescriptionIn:
      "Długość, biodra, klatka piersiowa i talia tego produktu w calach.",
  },
  about: {
    metaTitle: "O nas",
    heroKicker: "Nasza historia",
    heroTitle: "Syrenah",
    heroLead:
      "Elegancja zrodzona z pasji. Moda, która podkreśla Twoją wyjątkowość.",
    missionKicker: "Kim jesteśmy",
    missionBody:
      "Tworzymy modę dla kobiet, które wiedzą czego chcą. Jesteśmy siostrami – Marta i Claudia. Razem stworzyłyśmy Syrenah od zera. Zaczynając od samego początku, z ogromną determinacją uczymy się, projektujemy i budujemy tę markę krok po kroku. Wierzymy, że kiedy ma się odwagę próbować, nie ma rzeczy, których nie da się osiągnąć.",
    valuesKicker: "Nasze wartości",
    v1Title: "Kunszt i jakość",
    v1Body:
      "Dbamy o jakość, detale i najwyższy poziom obsługi. Syrenah to marka, która daje kobietom możliwość poczucia się wyjątkowo — bez kompromisów.",
    v2Title: "Pewność siebie",
    v2Body:
      "Nasza marka powstała z myślą o każdej kobiecie. Wierzymy, że styl i piękno nie mają jednego rozmiaru, koloru ani definicji. Chcemy, aby każda kobieta – niezależnie od sylwetki, koloru skóry czy wieku – mogła poczuć się w naszych projektach pewnie i wyjątkowo.",
    v3Title: "Symbolika syreny",
    v3Body:
      "Syrena jest symbolem kobiecej niezależności, siły i odwagi. To kobieta, która podąża własną drogą, słucha swojej intuicji i nie boi się być sobą.",
    manifestKicker: "Manifest",
    manifestQuote:
      "„Syrenah to manifest kobiecej siły. Wierzymy, że każda kobieta ma w sobie odwagę, by sięgać po więcej. Bo kiedy wierzysz w siebie, nie ma rzeczy niemożliwych.”",
    manifestSignoff: "Zespół Syrenah",
    ctaTitle: "Odkryj kolekcję",
    ctaShop: "Zobacz sklep",
  },
  contact: {
    metaTitle: "Kontakt",
    kicker: "Napisz do nas",
    title: "Kontakt",
    intro:
      "Masz pytanie dotyczące zamówienia, produktu lub współpracy? Chętnie pomożemy — wypełnij formularz, a odezwiemy się najszybciej jak to możliwe.",
    infoKicker: "Informacje",
    emailLabel: "E-mail",
    addressLabel: "Adres",
    addressLines: "Syrenah sp. z o.o.\nUl. Słoneczna 42B/2\n55-311 Kostomłoty",
    responseNote:
      "Odpowiadamy na wiadomości e-mail w ciągu 24 godzin w dni robocze.",
    nameLabel: "Imię i nazwisko",
    emailFieldLabel: "Adres e-mail",
    subjectLabel: "Temat",
    messageLabel: "Wiadomość",
    subjectPlaceholder: "Wybierz temat...",
    subjectProduct: "Pytanie o produkt",
    subjectOrder: "Status zamówienia",
    subjectReturn: "Zwrot lub wymiana",
    subjectComplaint: "Reklamacja",
    subjectCoop: "Współpraca",
    subjectOther: "Inne",
    messagePlaceholder: "Opisz swoją sprawę...",
    submit: "Wyślij wiadomość",
    submitting: "Wysyłanie...",
    toastFillRequired: "Wypełnij wszystkie wymagane pola.",
    toastMessageShort: "Wiadomość musi zawierać co najmniej 10 znaków.",
    toastSuccess: "Wiadomość wysłana! Odpowiemy najszybciej jak to możliwe.",
    toastError: "Wystąpił błąd podczas wysyłania.",
    toastNetwork: "Wystąpił błąd połączenia. Spróbuj ponownie później.",
  },
  cookie: {
    textPrefix: "Nasza strona korzysta z plików cookies, aby zapewnić Ci najwyższą jakość usług. Korzystając ze sklepu, akceptujesz naszą",
    privacyLink: "politykę prywatności",
    accept: "Akceptuję",
  },
  newsletter: {
    close: "Zamknij",
    title: "Newsletter",
    subtitle: "Zapisz się i bądź na bieżąco",
    emailPlaceholder: "Twój adres e-mail",
    consent:
      "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu otrzymywania newslettera.",
    submit: "Zapisz się",
    consentError: "Zaznacz zgodę na przetwarzanie danych.",
    errorGeneric: "Wystąpił błąd. Spróbuj ponownie.",
  },
  auth: {
    loginTitle: "Logowanie",
    loginSubtitle: "Zaloguj się do swojego konta",
    registerTitle: "Rejestracja",
    registerSubtitle: "Utwórz konto w Syrenah",
    email: "Adres email",
    password: "Hasło",
    confirmPassword: "Potwierdź hasło",
    submitLogin: "Zaloguj się",
    submitRegister: "Zarejestruj się",
    noAccount: "Nie masz konta?",
    hasAccount: "Masz już konto?",
    registerLink: "Zarejestruj się",
    loginLink: "Zaloguj się",
    invalidCreds: "Nieprawidłowy email lub hasło",
    unexpectedError: "Wystąpił nieoczekiwany błąd",
    passwordMismatch: "Hasła nie są identyczne",
    registerSuccess: "Konto utworzone. Możesz się zalogować.",
  },
  cart: {
    title: "Koszyk",
    empty: "Twój koszyk jest pusty",
    continueShopping: "Kontynuuj zakupy",
    subtotal: "Suma częściowa",
    discountCode: "Kod rabatowy",
    apply: "Zastosuj",
    removeDiscount: "Usuń kod",
    total: "Razem",
    checkout: "Do kasy",
    remove: "Usuń",
  },
  wishlist: {
    title: "Ulubione",
    empty: "Lista ulubionych jest pusta",
    browse: "Przeglądaj sklep",
  },
  regulamin: {
    kicker: "Dokumenty prawne",
    title: "Regulamin Sklepu",
    updated: "Ostatnia aktualizacja: Kwiecień 2026",
    sections: [
      {
        title: "§ 1. Postanowienia ogólne",
        ordered: true,
        items: [
          'Niniejszy Regulamin określa zasady korzystania ze sklepu internetowego Syrenah, dostępnego pod adresem www.syrenahthelabel.com (dalej: „Sklep").',
          "Właścicielem i operatorem Sklepu jest Syrenah sp. z o.o., z siedzibą przy Ul. Słoneczna 42B/2, 55-311 Kostomłoty, wpisana do rejestru przedsiębiorców prowadzonego przez Sąd Rejonowy dla Wrocławia-Fabrycznej we Wrocławiu, pod numerem KRS: 0001160021, NIP: 9131641193, REGON: 541107549.",
          "Kontakt ze Sklepem jest możliwy wyłącznie drogą elektroniczną, pod adresem e-mail: info@syrenahthelabel.com.",
          "Korzystanie ze Sklepu oznacza akceptację niniejszego Regulaminu.",
          "Regulamin jest udostępniany nieodpłatnie za pośrednictwem Sklepu w formie umożliwiającej jego pobranie, utrwalenie i wydrukowanie.",
        ],
      },
      {
        title: "§ 2. Definicje",
        ordered: false,
        items: [
          "Klient — osoba fizyczna posiadająca pełną zdolność do czynności prawnych, osoba prawna lub jednostka organizacyjna, która dokonuje lub zamierza dokonać zakupu w Sklepie.",
          "Konsument — Klient będący osobą fizyczną dokonującą ze Sprzedawcą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.",
          "Produkt — rzecz ruchoma dostępna w ofercie Sklepu, będąca przedmiotem umowy sprzedaży.",
          "Zamówienie — oświadczenie woli Klienta zmierzające do zawarcia umowy sprzedaży Produktu ze Sprzedawcą.",
          "Konto — indywidualne konto Klienta w Sklepie, umożliwiające korzystanie z dodatkowych funkcjonalności.",
        ],
      },
      {
        title: "§ 3. Zasady składania zamówień",
        ordered: true,
        items: [
          "Zamówienia można składać 24 godziny na dobę, 7 dni w tygodniu za pośrednictwem strony internetowej Sklepu.",
          "Złożenie zamówienia wymaga: wyboru Produktu, dodania go do koszyka, podania danych do wysyłki, wyboru metody dostawy oraz dokonania płatności.",
          "Zamówienia mogą być składane zarówno przez Klientów posiadających Konto, jak i bez rejestracji (jako gość).",
          "Po złożeniu zamówienia Klient otrzymuje na podany adres e-mail potwierdzenie przyjęcia zamówienia wraz z jego numerem.",
          "Umowa sprzedaży zostaje zawarta z chwilą potwierdzenia zamówienia przez Sprzedawcę.",
          "Sprzedawca zastrzega sobie prawo do odmowy realizacji zamówienia w przypadku podania nieprawdziwych lub niekompletnych danych przez Klienta.",
        ],
      },
      {
        title: "§ 4. Ceny i płatności",
        ordered: true,
        items: [
          "Wszystkie ceny podane w Sklepie zawierają podatek VAT.",
          "Dla krajów członkowskich Unii Europejskiej walutą rozliczeniową jest euro (EUR).",
          "Cena Produktu podana w chwili składania zamówienia jest wiążąca dla obu stron.",
          {
            lead: "Sklep umożliwia dokonanie płatności za pośrednictwem:",
            sub: [
              "systemu płatności online Stripe (karty płatnicze, BLIK, przelewy bankowe),",
              "innych metod płatności udostępnionych w procesie składania zamówienia.",
            ],
          },
          "Koszty dostawy są doliczane do ceny zamówienia i prezentowane Klientowi przed finalizacją zakupu.",
        ],
      },
      {
        title: "§ 5. Dostawa",
        ordered: true,
        items: [
          "Dostawa Produktów odbywa się na terytorium całej Unii Europejskiej.",
          "Realizacja dostaw następuje kurierem DHL.",
          "Przewidywany czas dostawy wynosi od 2 do 5 dni roboczych od momentu zaksięgowania płatności.",
          "Klient jest informowany o statusie przesyłki drogą e-mailową, w tym o nadaniu numeru przesyłki.",
        ],
      },
      {
        title: "§ 6. Prawo odstąpienia od umowy",
        ordered: true,
        items: [
          "Konsument ma prawo odstąpić od umowy zawartej na odległość w terminie 14 dni kalendarzowych bez podawania przyczyny i bez ponoszenia kosztów, z wyjątkiem kosztów określonych w pkt. 5 poniżej.",
          "Bieg terminu do odstąpienia od umowy rozpoczyna się od dnia, w którym Konsument objął Produkt w posiadanie lub w którym wskazana przez niego osoba trzecia inna niż przewoźnik objęła Produkt w posiadanie.",
          "Aby skorzystać z prawa odstąpienia od umowy, Konsument powinien poinformować Sprzedawcę o swojej decyzji, przesyłając wypełniony formularz zwrotu na adres e-mail: info@syrenahthelabel.com.",
          "Sprzedawca niezwłocznie, nie później niż w terminie 14 dni od dnia otrzymania formularza zwrotu, zwróci Konsumentowi wszystkie dokonane przez niego płatności, w tym koszty dostawy (z wyjątkiem dodatkowych kosztów wynikających z wybranego przez Konsumenta sposobu dostawy innego niż najtańszy).",
          "Konsument ponosi bezpośrednie koszty zwrotu Produktu.",
          "Produkt powinien zostać zwrócony w stanie niezmienionym, bez śladów użytkowania, z kompletnym opakowaniem i metkami.",
        ],
      },
      {
        title: "§ 7. Reklamacje",
        ordered: true,
        items: [
          "Sprzedawca jest zobowiązany dostarczyć Klientowi Produkt wolny od wad.",
          "Reklamacje można składać wyłącznie drogą elektroniczną na adres: info@syrenahthelabel.com.",
          "Reklamacja powinna zawierać: opis wady, datę jej stwierdzenia, żądanie Klienta (naprawa, wymiana, obniżenie ceny lub odstąpienie od umowy) oraz dowód zakupu.",
          "Sprzedawca rozpatrzy reklamację w terminie 14 dni kalendarzowych od dnia jej otrzymania i poinformuje Klienta o sposobie jej rozpatrzenia.",
        ],
      },
      {
        title: "§ 8. Ochrona danych osobowych",
        ordered: true,
        items: [
          "Administratorem danych osobowych Klientów jest Sprzedawca.",
          "Dane osobowe przetwarzane są zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) oraz ustawą o ochronie danych osobowych.",
          "Szczegółowe informacje dotyczące przetwarzania danych osobowych zawarte są w Polityce Prywatności dostępnej na stronie Sklepu.",
        ],
      },
      {
        title: "§ 9. Postanowienia końcowe",
        ordered: true,
        items: [
          "Sprzedawca zastrzega sobie prawo do zmiany niniejszego Regulaminu. O każdej zmianie Klienci zostaną poinformowani poprzez publikację nowej wersji Regulaminu na stronie Sklepu.",
          "W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz ustawy o prawach konsumenta.",
          "Wszelkie spory wynikłe z umów zawartych na podstawie niniejszego Regulaminu będą rozstrzygane przez sąd właściwy dla siedziby Sprzedawcy, z zastrzeżeniem, że w przypadku Konsumenta — sąd właściwy miejscowo zgodnie z przepisami Kodeksu postępowania cywilnego.",
          "Regulamin wchodzi w życie z dniem publikacji na stronie Sklepu.",
        ],
      },
    ],
  },
};

// Polityka + zwroty as structured content (abbrev keys in script for readability)
pl.polityka = {
  kicker: "Dokumenty prawne",
  title: "Polityka Prywatności",
  updated: "Ostatnia aktualizacja: Luty 2026",
  intro:
    "Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych Klientów sklepu internetowego Syrenah, dostępnego pod adresem www.syrenahthelabel.com. Dbamy o prywatność naszych Klientów i dokładamy wszelkich starań, aby dane osobowe były przetwarzane zgodnie z obowiązującymi przepisami prawa, w szczególności z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).",
  sections: [
    {
      title: "I. Administrator danych osobowych",
      ordered: true,
      items: [
        "Administratorem danych osobowych jest Syrenah sp. z o.o., z siedzibą przy Ul. Słoneczna 42B/2, 55-311 Kostomłoty, NIP: 9131641193, REGON: 541107549 (dalej: „Administrator”).",
        "Kontakt z Administratorem w sprawach dotyczących danych osobowych jest możliwy pod adresem e-mail: info@syrenahthelabel.com.",
      ],
    },
    {
      title: "II. Cele i podstawy przetwarzania danych",
      ordered: false,
      intro: "Dane osobowe Klientów przetwarzane są w następujących celach:",
      items: [
        "Realizacja zamówień — przetwarzanie danych jest niezbędne do wykonania umowy sprzedaży (art. 6 ust. 1 lit. b RODO). Obejmuje to imię, nazwisko, adres dostawy, adres e-mail, numer telefonu oraz dane do faktury.",
        "Prowadzenie Konta Klienta — na podstawie zgody Klienta (art. 6 ust. 1 lit. a RODO). Klient może w dowolnym momencie usunąć swoje konto.",
        "Marketing bezpośredni — w zakresie newslettera, na podstawie dobrowolnej zgody Klienta (art. 6 ust. 1 lit. a RODO). Zgoda może być wycofana w dowolnym momencie.",
        "Obsługa zapytań i reklamacji — w celu realizacji prawnie uzasadnionego interesu Administratora (art. 6 ust. 1 lit. f RODO).",
        "Obowiązki prawne — w zakresie wymaganym przepisami prawa, w szczególności prawa podatkowego i rachunkowego (art. 6 ust. 1 lit. c RODO).",
      ],
    },
    {
      title: "III. Okres przechowywania danych",
      ordered: false,
      items: [
        "Dane związane z realizacją zamówień przechowywane są przez okres wymagany przepisami prawa podatkowego (5 lat od końca roku podatkowego).",
        "Dane Konta Klienta przechowywane są do momentu usunięcia konta przez Klienta.",
        "Dane przetwarzane na podstawie zgody — do momentu jej wycofania.",
        "Dane dotyczące reklamacji — przez okres niezbędny do rozpatrzenia reklamacji oraz ewentualnego dochodzenia roszczeń.",
      ],
    },
    {
      title: "IV. Prawa osób, których dane dotyczą",
      ordered: false,
      intro: "Każdemu Klientowi przysługuje prawo do:",
      items: [
        "dostępu do swoich danych osobowych,",
        "sprostowania (poprawienia) danych,",
        "usunięcia danych („prawo do bycia zapomnianym”),",
        "ograniczenia przetwarzania danych,",
        "przenoszenia danych do innego administratora,",
        "wniesienia sprzeciwu wobec przetwarzania danych,",
        "cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania dokonanego przed cofnięciem zgody),",
        "wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).",
      ],
    },
    {
      title: "V. Odbiorcy danych",
      ordered: false,
      intro: "Dane osobowe mogą być przekazywane następującym kategoriom odbiorców:",
      items: [
        "firmom kurierskim i operatorom logistycznym (DPD, InPost) — w celu dostawy zamówień,",
        "operatorowi płatności (Stripe) — w celu obsługi transakcji płatniczych,",
        "dostawcy usług hostingowych i infrastruktury IT,",
        "dostawcy usług e-mail transakcyjnych (Resend),",
        "podmiotom uprawnionym na podstawie przepisów prawa.",
      ],
    },
    {
      title: "VI. Pliki cookies",
      ordered: true,
      items: [
        "Sklep korzysta z plików cookies (ciasteczek) w celu zapewnienia prawidłowego działania strony, analizy ruchu oraz personalizacji treści.",
        {
          lead: "Rodzaje wykorzystywanych plików cookies:",
          sub: [
            "Niezbędne — wymagane do prawidłowego działania Sklepu (sesja, koszyk, uwierzytelnianie).",
            "Analityczne — pomagają zrozumieć, w jaki sposób Klienci korzystają ze Sklepu.",
            "Marketingowe — wykorzystywane do wyświetlania spersonalizowanych treści reklamowych.",
          ],
        },
        "Klient może w dowolnym momencie zmienić ustawienia plików cookies w swojej przeglądarce internetowej, w tym zablokować ich zapisywanie.",
      ],
    },
    {
      title: "VII. Bezpieczeństwo danych",
      ordered: false,
      paragraphs: [
        "Administrator stosuje odpowiednie środki techniczne i organizacyjne zapewniające ochronę przetwarzanych danych osobowych, w szczególności zabezpiecza dane przed ich udostępnieniem osobom nieupoważnionym, utratą, uszkodzeniem lub zniszczeniem. Komunikacja ze Sklepem jest szyfrowana za pomocą protokołu SSL/TLS. Dane płatnicze są przetwarzane wyłącznie przez certyfikowanego operatora płatności (Stripe) i nie są przechowywane na serwerach Sklepu.",
      ],
    },
    {
      title: "VIII. Zmiany Polityki Prywatności",
      ordered: false,
      paragraphs: [
        "Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. O wszelkich zmianach Klienci zostaną poinformowani poprzez publikację zaktualizowanej wersji na stronie Sklepu. Korzystanie ze Sklepu po wprowadzeniu zmian oznacza ich akceptację.",
      ],
    },
  ],
};

pl.zwroty = {
  kicker: "Dokumenty prawne",
  title: "Zwroty i Reklamacje",
  updated: "Ostatnia aktualizacja: Kwiecień 2026",
  intro:
    "W Syrenah zależy nam na Twoim pełnym zadowoleniu z zakupów. Jeśli zakupiony produkt nie spełnia Twoich oczekiwań, masz prawo go zwrócić lub zareklamować. Poniżej znajdziesz szczegółowe informacje dotyczące procedury zwrotów i reklamacji.",
  returnsTitle: "Zwroty — prawo odstąpienia od umowy",
  returnsItems: [
    "Zgodnie z ustawą z dnia 30 maja 2014 r. o prawach konsumenta, Konsument ma prawo odstąpić od umowy zawartej na odległość w terminie 14 dni kalendarzowych od dnia odebrania przesyłki, bez podawania przyczyny.",
    {
      lead: "Aby dokonać zwrotu, należy:",
      sub: [
        "Przesłać wypełniony formularz zwrotu na adres e-mail: info@syrenahthelabel.com, podając numer zamówienia.",
        "Koniecznie zapakować produkt w oryginalne opakowanie (wraz z kompletem zawartości i metkami) i odesłać przesyłkę na adres magazynu: ul. Polna 22, 57-120 Wiązów.",
      ],
    },
    "Warunki zwrotu: Produkt musi być nieużywany, w stanie nienaruszonym, z kompletnym opakowaniem i oryginalnymi metkami. Produkty noszące ślady użytkowania, uszkodzone z winy Klienta lub bez metek nie podlegają zwrotowi.",
    "Koszt odesłania produktu ponosi Klient, chyba że zwrot wynika z winy Sprzedawcy (np. wysłanie wadliwego lub niezgodnego z zamówieniem produktu).",
    "Zwrot płatności nastąpi w terminie 14 dni od dnia otrzymania formularza zwrotu, tą samą metodą płatności, której użył Klient przy składaniu zamówienia. Sprzedawca może wstrzymać się ze zwrotem płatności do czasu otrzymania zwracanego produktu.",
  ],
  complaintsTitle: "Reklamacje",
  complaintsItems: [
    "Sprzedawca ponosi odpowiedzialność za wady fizyczne i prawne sprzedanego Produktu na zasadach określonych w Kodeksie cywilnym (rękojmia za wady).",
    {
      lead: "Reklamację można złożyć:",
      sub: [
        "wyłącznie drogą elektroniczną na adres: info@syrenahthelabel.com.",
      ],
    },
    {
      lead: "Zgłoszenie reklamacyjne powinno zawierać:",
      sub: [
        "imię i nazwisko Klienta,",
        "numer zamówienia,",
        "opis stwierdzonej wady,",
        "datę wykrycia wady,",
        "żądanie Klienta (naprawa, wymiana, obniżenie ceny lub odstąpienie od umowy),",
        "zdjęcia dokumentujące wadę (zalecane).",
      ],
    },
    "Reklamacja zostanie rozpatrzona w terminie 14 dni kalendarzowych od dnia jej otrzymania. O wyniku rozpatrzenia reklamacji Klient zostanie poinformowany drogą e-mailową.",
    "W przypadku uznania reklamacji, Sprzedawca — w zależności od żądania Klienta — naprawi lub wymieni Produkt na wolny od wad, obniży cenę lub zwróci pełną kwotę zakupu.",
    "Koszty przesyłki reklamowanego Produktu ponosi Sprzedawca w przypadku uznania reklamacji.",
  ],
  exchangeTitle: "Wymiana rozmiaru",
  exchangeItems: [
    "Jeśli zamówiony produkt nie pasuje rozmiarem, oferujemy możliwość jednorazowej wymiany na inny rozmiar (o ile jest dostępny w magazynie).",
    "Aby dokonać wymiany, skontaktuj się z nami pod adresem: info@syrenahthelabel.com, podając numer zamówienia i pożądany rozmiar.",
    "Koszty przesyłki wymiany w obie strony ponosi Klient.",
    "Produkt przeznaczony do wymiany musi być w stanie nienaruszonym, z oryginalnymi metkami.",
  ],
  formBoxTitle: "Formularz i kontakt",
  formBoxAddress:
    "Adres magazynu do przesyłek zwrotnych: ul. Polna 22, 57-120 Wiązów.",
  formBoxEmailNote:
    "W sprawach zwrotów i reklamacji kontakt jest możliwy wyłącznie drogą mailową na adres info@syrenahthelabel.com.",
  formBoxDownloadReturn: "Pobierz formularz zwrotu",
  formBoxDownloadComplaint: "Pobierz formularz reklamacji",
  formBoxContactForm: "Formularz kontaktowy",
};

// English dictionary — deep-clone PL then overwrite EN keys
const en = JSON.parse(JSON.stringify(pl));

function setEn() {
  en.nav = {
    home: "HOME",
    shop: "SHOP",
    about: "ABOUT",
    contact: "CONTACT",
    collections: "COLLECTIONS",
    searchPlaceholder: "SEARCH...",
    categories: "CATEGORIES",
    login: "Sign in",
    myAccount: "My account",
    mobileMenuTitle: "Main menu",
    openMenu: "Open menu",
    wishlistAria: "Wishlist",
    cartAria: "Cart",
    accountAria: "Account",
  };
  en.footer = {
    info: "Information",
    about: "About us",
    contact: "Contact",
    terms: "Terms & Conditions",
    privacy: "Privacy policy",
    returns: "Returns & complaints",
    social: "Social",
    shopData: "Store details",
    copyright: "All rights reserved.",
  };
  en.home = { newest: "NEW ARRIVALS", seeAll: "View all" };
  en.instagram = { title: "INSTAGRAM" };
  en.shop = {
    codePrefix: "CODE:",
    preparing: "New pieces in the making \u2728",
    searchTitle: "SEARCH RESULTS:",
    foundOne: "Found",
    product: "product",
    products: "products",
    noResults: "No products found for",
    filterAll: "ALL",
    filterNew: "NEW IN",
    filterSale: "SALE",
    sortNewest: "Newest",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortPriceLabel: "Price",
  };
  en.product = {
    shopCrumb: "SHOP",
    size: "Size",
    color: "Colour",
    addToCart: "Add to cart",
    outOfStock: "Out of stock",
    selectSize: "Please select a size",
  };
  en.sizeChart = {
    trigger: "Size guide",
    title: "Size guide",
    subtitle: "measurements in cm",
    srDescription:
      "Length, hips, chest and waist of this product in centimetres.",
    colSize: "Size",
    colLength: "Length",
    colHips: "Hips",
    colChest: "Chest",
    colWaist: "Waist",
    caption: "Size chart, measurements in centimetres",
    footnote: "Measurements for this product, in centimetres.",
    unitCm: "cm",
    unitIn: "in",
    subtitleIn: "measurements in inches",
    captionIn: "Size chart, measurements in inches",
    footnoteIn: "Converted from centimetres. 1 inch = 2.54 cm.",
    srDescriptionIn:
      "Length, hips, chest and waist of this product in inches.",
  };
  en.about = {
    metaTitle: "About us",
    heroKicker: "Our story",
    heroTitle: "Syrenah",
    heroLead:
      "Elegance born from passion. Fashion that celebrates what makes you unique.",
    missionKicker: "Who we are",
    missionBody:
      "We create fashion for women who know what they want. We are sisters — Marta and Claudia. Together we built Syrenah from the ground up. From day one, with determination, we learn, design and grow this brand step by step. We believe that when you dare to try, nothing is out of reach.",
    valuesKicker: "Our values",
    v1Title: "Craftsmanship & quality",
    v1Body:
      "We care about quality, detail and a premium experience. Syrenah is a brand that lets women feel exceptional — without compromise.",
    v2Title: "Confidence",
    v2Body:
      "Our brand was created with every woman in mind. We believe style and beauty have no single size, colour or definition. We want every woman — whatever her shape, skin tone or age — to feel confident and special in our designs.",
    v3Title: "The mermaid symbol",
    v3Body:
      "The mermaid stands for feminine independence, strength and courage. She follows her own path, trusts her intuition and is not afraid to be herself.",
    manifestKicker: "Manifesto",
    manifestQuote:
      "“Syrenah is a manifesto of feminine strength. We believe every woman has the courage to reach higher. Because when you believe in yourself, nothing is impossible.”",
    manifestSignoff: "The Syrenah team",
    ctaTitle: "Discover the collection",
    ctaShop: "Shop now",
  };
  en.contact = {
    metaTitle: "Contact",
    kicker: "Write to us",
    title: "Contact",
    intro:
      "Questions about an order, a product or a collaboration? We will be glad to help — use the form below and we will get back to you as soon as we can.",
    infoKicker: "Details",
    emailLabel: "Email",
    addressLabel: "Address",
    addressLines: "Syrenah sp. z o.o.\nUl. Słoneczna 42B/2\n55-311 Kostomłoty, Poland",
    responseNote:
      "We respond to emails within 24 hours on business days.",
    nameLabel: "Full name",
    emailFieldLabel: "Email address",
    subjectLabel: "Subject",
    messageLabel: "Message",
    subjectPlaceholder: "Choose a subject...",
    subjectProduct: "Product enquiry",
    subjectOrder: "Order status",
    subjectReturn: "Return or exchange",
    subjectComplaint: "Complaint",
    subjectCoop: "Collaboration",
    subjectOther: "Other",
    messagePlaceholder: "Tell us how we can help...",
    submit: "Send message",
    submitting: "Sending...",
    toastFillRequired: "Please fill in all required fields.",
    toastMessageShort: "Your message must be at least 10 characters.",
    toastSuccess: "Message sent! We will reply as soon as possible.",
    toastError: "Something went wrong while sending your message.",
    toastNetwork: "Connection error. Please try again later.",
  };
  en.cookie = {
    textPrefix:
      "We use cookies to give you the best experience. By using the store you accept our",
    privacyLink: "privacy policy",
    accept: "Accept",
  };
  en.newsletter = {
    close: "Close",
    title: "Newsletter",
    subtitle: "Subscribe and stay in the loop",
    emailPlaceholder: "Your email address",
    consent:
      "I agree to the processing of my personal data in order to receive the newsletter.",
    submit: "Subscribe",
    consentError: "Please accept the consent to proceed.",
    errorGeneric: "Something went wrong. Please try again.",
  };
  en.auth = {
    loginTitle: "Sign in",
    loginSubtitle: "Sign in to your account",
    registerTitle: "Create account",
    registerSubtitle: "Create your Syrenah account",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    submitLogin: "Sign in",
    submitRegister: "Register",
    noAccount: "Don’t have an account?",
    hasAccount: "Already have an account?",
    registerLink: "Register",
    loginLink: "Sign in",
    invalidCreds: "Invalid email or password",
    unexpectedError: "An unexpected error occurred",
    passwordMismatch: "Passwords do not match",
    registerSuccess: "Account created. You can sign in now.",
  };
  en.cart = {
    title: "Cart",
    empty: "Your cart is empty",
    continueShopping: "Continue shopping",
    subtotal: "Subtotal",
    discountCode: "Discount code",
    apply: "Apply",
    removeDiscount: "Remove code",
    total: "Total",
    checkout: "Checkout",
    remove: "Remove",
  };
  en.wishlist = {
    title: "Wishlist",
    empty: "Your wishlist is empty",
    browse: "Browse the shop",
  };

  en.regulamin = {
    kicker: "Legal",
    title: "Terms & Conditions",
    updated: "Last updated: April 2026",
    sections: [
      {
        title: "§ 1. General provisions",
        ordered: true,
        items: [
          "These Terms & Conditions govern the use of the Syrenah online store available at www.syrenahthelabel.com (hereinafter: the “Store”).",
          "The Store is owned and operated by Syrenah sp. z o.o., with its registered office at Ul. Słoneczna 42B/2, 55-311 Kostomłoty, Poland, entered in the register of entrepreneurs kept by the District Court for Wrocław-Fabryczna in Wrocław under KRS number 0001160021, NIP: 9131641193, REGON: 541107549.",
          "The Store can be contacted exclusively by email at info@syrenahthelabel.com.",
          "Use of the Store constitutes acceptance of these Terms & Conditions.",
          "The Terms & Conditions are made available free of charge via the Store in a form that allows them to be downloaded, saved and printed.",
        ],
      },
      {
        title: "§ 2. Definitions",
        ordered: false,
        items: [
          "Customer — a natural person with full legal capacity, a legal person or an organisational unit that makes or intends to make a purchase in the Store.",
          "Consumer — a Customer who is a natural person entering into a legal transaction with the Seller that is not directly related to their business or professional activity.",
          "Product — movable goods offered in the Store that are the subject of a sales contract.",
          "Order — a declaration of intent by the Customer to conclude a sales contract for a Product with the Seller.",
          "Account — an individual customer account in the Store enabling additional functionality.",
        ],
      },
      {
        title: "§ 3. Placing orders",
        ordered: true,
        items: [
          "Orders may be placed 24 hours a day, 7 days a week via the Store website.",
          "Placing an order requires: selecting a Product, adding it to the cart, providing shipping details, choosing a delivery method and completing payment.",
          "Orders may be placed both by registered Customers and without registration (as a guest).",
          "After placing an order, the Customer receives an email confirmation with the order number.",
          "The sales contract is concluded when the Seller confirms the order.",
          "The Seller reserves the right to refuse to fulfil an order if the Customer provides false or incomplete data.",
        ],
      },
      {
        title: "§ 4. Prices and payment",
        ordered: true,
        items: [
          "All prices shown in the Store include VAT.",
          "For EU Member States, the settlement currency is the euro (EUR).",
          "The Product price at the time the order is placed is binding on both parties.",
          {
            lead: "The Store enables payment via:",
            sub: [
              "the Stripe online payment system (payment cards, BLIK, bank transfers),",
              "other payment methods made available during checkout.",
            ],
          },
          "Delivery costs are added to the order total and shown to the Customer before the purchase is finalised.",
        ],
      },
      {
        title: "§ 5. Delivery",
        ordered: true,
        items: [
          "Products are delivered throughout the European Union.",
          "Delivery is carried out by DHL courier.",
          "Estimated delivery time is 2–5 business days from the moment payment is credited.",
          "The Customer is informed of the shipment status by email, including the tracking number once the parcel is dispatched.",
        ],
      },
      {
        title: "§ 6. Right of withdrawal",
        ordered: true,
        items: [
          "The Consumer has the right to withdraw from a distance contract within 14 calendar days without giving any reason and without incurring costs, except for the costs referred to in point 5 below.",
          "The withdrawal period begins on the day on which the Consumer acquires possession of the Product or on which a third party other than the carrier, indicated by the Consumer, acquires possession of the Product.",
          "To exercise the right of withdrawal, the Consumer should inform the Seller of their decision by sending the completed return form to info@syrenahthelabel.com.",
          "The Seller shall refund all payments received from the Consumer, including delivery costs (except for additional costs resulting from the Consumer’s choice of a delivery method other than the cheapest standard delivery), without undue delay and in any event no later than 14 days from receipt of the return form.",
          "The Consumer shall bear the direct cost of returning the Product.",
          "The Product must be returned unchanged, unused, with complete packaging and tags.",
        ],
      },
      {
        title: "§ 7. Complaints",
        ordered: true,
        items: [
          "The Seller is obliged to deliver a Product free from defects.",
          "Complaints may be submitted exclusively by email to info@syrenahthelabel.com.",
          "A complaint should include: a description of the defect, the date it was discovered, the Customer’s request (repair, replacement, price reduction or withdrawal from the contract) and proof of purchase.",
          "The Seller will process the complaint within 14 calendar days of receipt and inform the Customer of the outcome.",
        ],
      },
      {
        title: "§ 8. Personal data",
        ordered: true,
        items: [
          "The Seller is the controller of Customers’ personal data.",
          "Personal data are processed in accordance with Regulation (EU) 2016/679 (GDPR) and applicable national data protection laws.",
          "Further information on data processing is available in the Privacy Policy published on the Store website.",
        ],
      },
      {
        title: "§ 9. Final provisions",
        ordered: true,
        items: [
          "The Seller reserves the right to amend these Terms & Conditions. Customers will be informed of any changes by publication of a new version on the Store website.",
          "Matters not regulated herein shall be governed by Polish law, in particular the Civil Code and consumer protection legislation.",
          "Any disputes arising from contracts concluded under these Terms & Conditions shall be resolved by the court having jurisdiction over the Seller’s seat, without prejudice to mandatory provisions granting Consumers jurisdiction under the law.",
          "These Terms & Conditions enter into force on the date of publication on the Store website.",
        ],
      },
    ],
  };

  en.polityka = {
    kicker: "Legal",
    title: "Privacy Policy",
    updated: "Last updated: February 2026",
    intro:
      "This Privacy Policy describes how Syrenah, the online store available at www.syrenahthelabel.com, processes and protects personal data. We respect our customers’ privacy and process personal data in accordance with applicable law, in particular Regulation (EU) 2016/679 (GDPR).",
    sections: [
      {
        title: "I. Data controller",
        ordered: true,
        items: [
          "The controller of your personal data is Syrenah sp. z o.o., with its registered office at Ul. Słoneczna 42B/2, 55-311 Kostomłoty, Poland, NIP: 9131641193, REGON: 541107549 (hereinafter: the “Controller”).",
          "You can contact the Controller regarding personal data at info@syrenahthelabel.com.",
        ],
      },
      {
        title: "II. Purposes and legal bases for processing",
        ordered: false,
        intro: "Personal data are processed for the following purposes:",
        items: [
          "Order fulfilment — necessary for performing the sales contract (Art. 6(1)(b) GDPR), including name, delivery address, email, phone number and invoicing details.",
          "Customer account — based on your consent (Art. 6(1)(a) GDPR). You may delete your account at any time.",
          "Direct marketing — for the newsletter, based on your voluntary consent (Art. 6(1)(a) GDPR). Consent may be withdrawn at any time.",
          "Handling enquiries and complaints — based on the Controller’s legitimate interest (Art. 6(1)(f) GDPR).",
          "Legal obligations — where required by law, in particular tax and accounting rules (Art. 6(1)(c) GDPR).",
        ],
      },
      {
        title: "III. Retention periods",
        ordered: false,
        items: [
          "Order-related data are kept for the period required by tax law (5 years after the end of the tax year).",
          "Account data are kept until you delete your account.",
          "Data processed on the basis of consent are kept until consent is withdrawn.",
          "Complaint-related data are kept for the time necessary to handle the complaint and any related claims.",
        ],
      },
      {
        title: "IV. Data subject rights",
        ordered: false,
        intro: "Each Customer has the right to:",
        items: [
          "access their personal data,",
          "rectify inaccurate data,",
          "erasure (“right to be forgotten”),",
          "restriction of processing,",
          "data portability,",
          "object to processing,",
          "withdraw consent at any time (without affecting the lawfulness of processing before withdrawal),",
          "lodge a complaint with the President of the Polish Personal Data Protection Office (ul. Stawki 2, 00-193 Warsaw).",
        ],
      },
      {
        title: "V. Recipients of data",
        ordered: false,
        intro: "Personal data may be shared with:",
        items: [
          "courier and logistics operators (DPD, InPost) — for delivery,",
          "the payment operator (Stripe) — for payment processing,",
          "hosting and IT infrastructure providers,",
          "transactional email providers (Resend),",
          "entities entitled to receive data under applicable law.",
        ],
      },
      {
        title: "VI. Cookies",
        ordered: true,
        items: [
          "The Store uses cookies to ensure proper operation, analyse traffic and personalise content.",
          {
            lead: "Types of cookies used:",
            sub: [
              "Strictly necessary — required for the Store to function (session, cart, authentication).",
              "Analytics — help us understand how customers use the Store.",
              "Marketing — used to display personalised advertising content.",
            ],
          },
          "You can change cookie settings in your browser at any time, including blocking cookies.",
        ],
      },
      {
        title: "VII. Security",
        ordered: false,
        paragraphs: [
          "The Controller applies appropriate technical and organisational measures to protect personal data against unauthorised access, loss, damage or destruction. Communication with the Store is encrypted using SSL/TLS. Payment data are processed solely by the certified payment operator (Stripe) and are not stored on the Store’s servers.",
        ],
      },
      {
        title: "VIII. Changes to this Privacy Policy",
        ordered: false,
        paragraphs: [
          "The Controller may update this Privacy Policy. Customers will be informed by publication of the updated version on the Store website. Continued use of the Store after changes constitutes acceptance of the updated Policy.",
        ],
      },
    ],
  };

  en.zwroty = {
    kicker: "Legal",
    title: "Returns & Complaints",
    updated: "Last updated: April 2026",
    intro:
      "We want you to be fully satisfied with your purchase. If a product does not meet your expectations, you may return it or make a complaint. Below you will find detailed information on returns and complaints.",
    returnsTitle: "Returns — right of withdrawal",
    returnsItems: [
      "Under the Consumer Rights Act, a Consumer may withdraw from a distance contract within 14 calendar days of receiving the parcel, without giving a reason.",
      {
        lead: "To return a product, you must:",
        sub: [
          "Send the completed return form to info@syrenahthelabel.com, stating your order number.",
          "Pack the product in its original packaging (with all contents and tags) and send the parcel to our warehouse at: ul. Polna 22, 57-120 Wiązów, Poland.",
        ],
      },
      "Return conditions: the product must be unused, undamaged, with complete packaging and original tags. Items showing signs of use, damaged by the Customer or without tags cannot be returned.",
      "The cost of returning the product is borne by the Customer, unless the return is due to the Seller’s fault (e.g. defective or incorrect item).",
      "Refunds will be made within 14 days of receipt of the return form, using the same payment method used for the order. The Seller may withhold the refund until the returned product is received.",
    ],
    complaintsTitle: "Complaints",
    complaintsItems: [
      "The Seller is liable for physical and legal defects of the Product under the Civil Code (statutory warranty).",
      {
        lead: "A complaint may be submitted:",
        sub: ["exclusively by email to info@syrenahthelabel.com."],
      },
      {
        lead: "The complaint should include:",
        sub: [
          "the Customer’s full name,",
          "order number,",
          "description of the defect,",
          "date the defect was discovered,",
          "the Customer’s request (repair, replacement, price reduction or withdrawal from the contract),",
          "photos documenting the defect (recommended).",
        ],
      },
      "The complaint will be processed within 14 calendar days of receipt. The Customer will be informed of the outcome by email.",
      "If the complaint is upheld, the Seller will, depending on the Customer’s request, repair or replace the Product, reduce the price or refund the full purchase amount.",
      "If the complaint is upheld, the Seller bears the cost of shipping the defective Product.",
    ],
    exchangeTitle: "Size exchange",
    exchangeItems: [
      "If the size does not fit, we offer a one-time exchange for another size (subject to availability).",
      "To request an exchange, contact us at info@syrenahthelabel.com with your order number and desired size.",
      "The Customer bears the shipping costs for the exchange both ways.",
      "The product must be in perfect condition with original tags.",
    ],
    formBoxTitle: "Forms and contact",
    formBoxAddress:
      "Return shipping address: ul. Polna 22, 57-120 Wiązów, Poland.",
    formBoxEmailNote:
      "For returns and complaints, contact is available only by email at info@syrenahthelabel.com.",
    formBoxDownloadReturn: "Download return form",
    formBoxDownloadComplaint: "Download complaint form",
    formBoxContactForm: "Contact form",
  };
}

setEn();

fs.mkdirSync(path.join(root, "dictionaries"), { recursive: true });
fs.writeFileSync(
  path.join(root, "dictionaries", "pl.json"),
  JSON.stringify(pl, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(root, "dictionaries", "en.json"),
  JSON.stringify(en, null, 2),
  "utf8"
);
console.log("Wrote dictionaries/pl.json and dictionaries/en.json");
