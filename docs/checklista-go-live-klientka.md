# Syrenah — checklista przed LIVE
### Co klientka ma zrobić krok po kroku

Dokument dla: właścicielki marki Syrenah  
Status hostingu: sklep **już jest na Netlify** (deploy z brancha `dev`). Do startu produkcyjnego wystarczy **deploy / publikacja z `main`** + produkcyjne klucze i domena.  
Uwaga: część techniczną (merge/push na `main`, env na Netlify, kod) robi developer — poniżej to, co leży po stronie klientki / firmy.

---

## Ważne: powiadomienia o zamówieniach

**Jak jest teraz w sklepie:**

| Kto | Co dostaje |
|-----|------------|
| **Klientka kupująca** | E-mail potwierdzenia zamówienia (po udanej płatności Stripe) |
| **Właścicielka sklepu** | **Nie dostaje automatycznego maila** o nowym zamówieniu |

Nowe zamówienia widać w **panelu admina** → Zamówienia (status PAID po płatności).

Na razie zostaje tak jak jest (ustalone). Ewentualny mail do sklepu przy zamówieniu = osobna decyzja później. Do monitoringu: panel admina i/lub powiadomienia w **Stripe Dashboard**.

---

## 1. Domena i publikacja na `main` (Netlify)

### Stan obecny
- Netlify już skonfigurowane, strona wisi z deployu brancha **`dev`**.
- Nie trzeba zakładać nowego hostingu od zera.

### Co zrobić (klientka)
1. Potwierdź **finalną domenę** produkcyjną (np. `syrenahthelabel.com` / `www`).
2. Upewnij się, że masz dostęp do panelu DNS tej domeny.
3. Gdy developer poda rekordy pod Netlify (A/CNAME) — wpisz je w DNS (jeśli domena jeszcze nie wskazuje na produkcyjny site).
4. Po propagacji DNS sprawdź, że produkcyjny URL otwiera się na `https://…` (kłódka).
5. Potwierdź, że „strona w budowie” / preview z `dev` ma zostać zastąpione wersją z **`main`**.

### Po stronie developera
1. Merge / push aktualnego kodu na **`main`**.
2. W Netlify: production branch = **`main`** (deploy produkcyjny).
3. Ustawić / zweryfikować **env production** na Netlify (Stripe Live, Resend, InPost, `NEXT_PUBLIC_APP_URL` = domena prod, itd.) — nie wartości z localhost / test.
4. Po deployu: smoke test na domenie produkcyjnej.
5. Opcjonalnie: branch `dev` zostaje jako staging / preview.

---

## 2. Stripe — płatności kartą (i ewentualnie BLIK)

Bez dokończenia Stripe **nie da się** przyjmować prawdziwych płatności.

### Co zrobić (kolejność)
1. Załóż / zaloguj się na [https://dashboard.stripe.com](https://dashboard.stripe.com) na konto **firmowe** marki.
2. Uzupełnij dane firmy, właściciela, adres, NIP (jeśli dotyczy).
3. Przejdź weryfikację tożsamości / firmy (**KYC**) — Stripe o to poprosi.
4. Dodaj **konto bankowe** do wypłat.
5. W prawym górnym rogu przełącz z **Test** na **Live**.
6. Wejdź w **Developers → API keys** i skopiuj:
   - Secret key (`sk_live_…`)
   - Publishable key (`pk_live_…`)
7. Wyślij te klucze **bezpiecznie** developerowi (nie na publiczny chat / nie commit do GitHub).
8. Razem z developerem: **Developers → Webhooks → Add endpoint**
   - URL: `https://PRODUKCYJNA-DOMENA/api/webhook/stripe`  
     (ten sam host co Netlify production / `main` — nie URL z preview `dev`)
   - Zdarzenia:  
     `checkout.session.completed`  
     `checkout.session.async_payment_failed`  
     `checkout.session.expired`
9. Skopiuj **Signing secret** (`whsec_…`) i przekaż developerowi.
10. W ustawieniach płatności sprawdź włączone metody (karta; jeśli chcesz BLIK — włącz w Live).
11. Po go-live: zrób **testową małą płatność** prawdziwą kartą i sprawdź, czy zamówienie wpadło do admina.

### Uwagi
- Sklep rozlicza checkout w **PLN**.
- Wypłaty Stripe idą na konto po weryfikacji (harmonogram Stripe).

---

## 3. InPost — paczkomaty i wysyłka

W sklepie są **dwie osobne rzeczy**:

### A) Mapa paczkomatów na checkout (Geowidget)
Klient wybiera paczkomat na mapie.

**Co zrobić:**
1. Załóż / zaloguj się w panelu InPost dla firm / Manager.
2. Znajdź sekcję **Geowidget** / token do mapy (dokumentacja InPost / support).
3. Wygeneruj **token produkcyjny** (nie testowy).
4. Przekaż token developerowi → trafi do `NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN`.

Teraz w projekcie jest `test_token` — mapa na produkcji **nie będzie działać** bez prawdziwego tokena.

### B) Realne nadawanie paczek
Sklep **nie drukuje etykiet automatycznie**. W adminie widać: adres kuriera albo **kod paczkomatu**. Paczkę nadajesz Ty (lub magazyn) w **Manager InPost** / u kuriera.

**Co zrobić:**
1. Podpisz umowę / aktywuj konto **InPost dla biznesu** (Manager InPost) — to osobna sprawa od mapy.
2. Ustal, kto pakuje i nadaje zamówienia oraz w jakim terminie (np. 1–3 dni robocze).
3. Potwierdź ceny w sklepie (obecnie na sztywno):
   - Kurier: **15 zł**
   - Paczkomat: **10 zł**  
   Jeśli inne — powiedz developerowi do zmiany w kodzie.
4. Ustal, czy sprzedajesz tylko do PL, czy też zagranicę (obecny flow jest pod PL).

---

## 4. E-maile sklepu (Resend)

Maile idą przez usługę **Resend** (nie przez zwykłą skrzynkę Gmail jako silnik wysyłki).

### Co zrobić
1. Potwierdź adres, z którego mają iść maile (np. `orders@syrenahthelabel.com` lub `info@…`).
2. Potwierdź skrzynkę na wiadomości z formularza kontaktowego (domyślnie `info@syrenahthelabel.com`).
3. Przy weryfikacji domeny w Resend: developer poda rekordy DNS (SPF, DKIM) — **dodaj je w panelu domeny**.
4. Po weryfikacji: developer zmieni w kodzie nadawcę z testowego `onboarding@resend.dev` na Waszą domenę.

### Bez tego
Na produkcji maile do klientów często **nie dojdą** (albo tylko do adresów testowych).

### Test przed live
- Złóż testowe zamówienie → mail do kupującego.
- Wyślij formularz kontaktowy → mail na skrzynkę sklepu.
- Zmień status zamówienia w adminie → mail o statusie do klienta.

---

## 5. Instagram i TikTok

### Stopka sklepu
Linki do `@syrenah_the_label` (IG + TikTok) są już podpięte.

### Sekcja „INSTAGRAM” na stronie głównej (kafelki)
**Decyzja do podjęcia:**

**Opcja A — Live z Instagrama (token Meta)**  
1. Konto IG musi być **Professional** (Business / Creator).  
2. Wejdź na [https://developers.facebook.com](https://developers.facebook.com) (konto Meta powiązane z IG).  
3. Utwórz / otwórz aplikację → setup Instagram API.  
4. Wygeneruj **Access Token** + skopiuj **Instagram User ID**.  
5. Przekaż developerowi → `INSTAGRAM_ACCESS_TOKEN` + `INSTAGRAM_USER_ID` (Netlify).  
6. Token z dashboardu zwykle ważny ok. **60 dni** — trzeba odświeżać.  
7. **Rolki:** w kafelku widać tylko miniaturę (często nieidealną), nie odtwarza się wideo. Można ustawić „tylko zdjęcia”.

**Opcja B — Ręczne zdjęcia (ładniejszy lookbook)**  
1. Wybierasz 4–5 ładnych, kwadratowych zdjęć.  
2. Developer wrzuca je do sklepu **albo** (później) powstaje panel w adminie.  
3. Pełna kontrola wyglądu, zero Meta / tokenów.

**Rekomendacja na start butiku:** często B (wygląd), albo A bez rolek.

---

## 6. Panel administracyjny (dostęp)

### Co zrobić
1. Wejdź na stronę sklepu → **Zarejestruj** konto na swój mail firmowy.
2. Napisz developerowi ten adres e-mail.
3. Developer ustawi w bazie rolę **ADMIN**.
4. Zaloguj się → wejdź na `/admin`.
5. Przy pierwszym wejściu w produkty/zamówienia przeglądarka zapyta o **token admina** — wpisz wartość przekazaną przez developera (to nie hasło do konta, tylko drugi sekret).
6. Zapisz token w bezpiecznym miejscu (menedżer haseł).

### W panelu zobaczysz m.in.
Zamówienia, produkty, kategorie, rabaty, hero, newsletter.

---

## 7. Treści sklepu i katalog

### Co zrobić przed / tuż po live
1. Uzupełnij produkty: nazwa PL + EN, cena PLN (+ EUR jeśli sprzedaż EN), stock, zdjęcia, rozmiary.
2. Sprawdź kategorie.
3. Ustaw baner Hero (zdjęcia / tekst).
4. Potwierdź treści stron: O nas, Kontakt, **Regulamin**, **Polityka prywatności**, **Zwroty i reklamacje**.
5. Sprawdź dane w stopce (nazwa, e-mail; ewentualnie NIP / adres do faktur).

---

## 8. Sprawy formalne / operacyjne

### Co ustalić / zrobić
1. Forma działalności pod sprzedaż online (JDG / spółka) — zgodna ze Stripe i InPost.
2. Kto wystawia **faktury VAT** (w checkout klienci mogą zaznaczyć „chcę fakturę”) — np. wFirma, Excel, biuro.
3. Adres i procedura **zwrotów** (14 dni) — kto pokrywa koszt przesyłki zwrotnej.
4. Czas realizacji zamówienia — komunikat dla klientów (strona / mail).
5. Kto codziennie sprawdza admina (dopóki nie ma maila do sklepu o nowym zamówieniu).

---

## 9. Smoke test w dniu startu (razem z developerem)

Po deployu z **`main`** na Netlify:

1. Strona otwiera się na **produkcyjnej** domenie z kłódką HTTPS (nie preview z `dev`).  
2. Rejestracja / logowanie działa.  
3. Dodanie do koszyka → checkout → **płatność Live** (mała kwota).  
4. W Stripe Dashboard widać płatność (tryb Live).  
5. W adminie zamówienie ze statusem **PAID**.  
6. Klient dostał mail potwierdzenia.  
7. Paczkomat: mapa działa (token prod), wybór punktu zapisuje się.  
8. Kurier: adres zapisuje się.  
9. Formularz kontaktowy działa.  
10. Przełącznik PL / EN OK.

---

## Podsumowanie: co klientka musi „załatwić na zewnątrz”

| Temat | Działanie klientki |
|-------|-------------------|
| **Netlify / domena** | Potwierdzić domenę prod; DNS jeśli trzeba (hosting już jest — publikacja z `main`) |
| **Stripe** | Konto Live, KYC, konto bankowe, klucze + webhook secret |
| **InPost** | Umowa/Manager do nadawania + token Geowidget do mapy |
| **Resend / DNS** | Rekordy DNS domeny pod maile |
| **Instagram** | Decyzja A/B; przy A — token Meta |
| **Admin** | Rejestracja konta; odebranie tokena admina |
| **Treści / prawo** | Regulamin, prywatność, zwroty, produkty |
| **Operacja** | Kto pakuje, faktury, monitoring zamówień w adminie |

---

## Pytania do ustalenia na rozmowie

1. Ceny wysyłki 15 / 10 zł — finalne?  
2. Instagram: live czy ręczne zdjęcia?  
3. BLIK w Stripe — tak / nie?  
4. Tylko Polska, czy też wysyłka UE?  
5. (Później) Czy chcesz mail do sklepu przy każdym zamówieniu? — na razie bez zmian.

---

*Dokument wewnętrzny projektu Syrenah Store — przed go-live.  
Aktualizacja: Netlify już działa na `dev`; live = deploy `main` + produkcyjne sekrety / domena.*
