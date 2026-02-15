# System Quizów Lokalnych 🎓

Aplikacja typu **"Drill & Practice"** do nauki przed egzaminami, napisana w **React + Vite**. Umożliwia łatwe dodawanie własnych pytań poprzez pliki JSON i śledzenie postępów nauki.

## 🚀 Funkcje

* **Dynamiczne moduły:** Wystarczy wrzucić plik `.json` do folderu, a aplikacja sama go wykryje.
* **Inteligentna powtórka:** System pamięta, na które pytania odpowiedziałeś poprawnie i nie wyświetla ich ponownie w danej sesji (dane zapisywane w `LocalStorage`).
* **Tryby pytań:** Obsługa pytań jednokrotnego i wielokrotnego wyboru.
* **Tryb Ciemny:** Nowoczesny interfejs oparty na **Tailwind CSS**.
---

## 🛠️ Wymagania

Aby uruchomić projekt, musisz mieć zainstalowane:

* **Node.js** (wersja 18 lub nowsza) – [Pobierz tutaj](https://nodejs.org/)
* **Git** (opcjonalnie, do pobrania repozytorium)

---

## 📥 Instalacja i Uruchomienie

Wykonaj poniższe kroki w terminalu:

### 1. Pobierz projekt

Sklonuj repozytorium lub pobierz je jako plik ZIP i rozpakuj.

### 2. Zainstaluj zależności

Komenda ta pobierze folder `node_modules` na podstawie pliku `package.json`.

```bash
npm install

```

### 3. Uruchom aplikację

To polecenie uruchomi lokalny serwer deweloperski.

```bash
npm run dev

```

Po wpisaniu tej komendy zobaczysz w terminalu link (zazwyczaj `http://localhost:5173/`). Kliknij go z przytrzymanym klawiszem **Ctrl** (lub **Cmd** na Mac), aby otworzyć aplikację w przeglądarce.

---

## 📚 Jak dodać własne pytania?

Nie musisz edytować kodu, aby dodać nowy przedmiot!

1. Otwórz folder projektu.
2. Przejdź do ścieżki: `src/modules/`.
3. Utwórz nowy plik tekstowy z rozszerzeniem `.json`, np. `biologia.json`.
4. Wklej do niego pytania, zachowując poniższy format:

```json
[
  {
    "category": "Genetyka",
    "type": "single",
    "question": "Podstawową jednostką dziedziczenia jest:",
    "options": [
      { "text": "Komórka", "correct": false },
      { "text": "Gen", "correct": true },
      { "text": "Tkanka", "correct": false }
    ],
    "explanation": "Gen to odcinek DNA kodujący informację o budowie białka lub RNA."
  },
  {
    "category": "Budowa komórki",
    "type": "multi",
    "question": "Zaznacz struktury występujące w komórce roślinnej:",
    "options": [
      { "text": "Ściana komórkowa", "correct": true },
      { "text": "Chloroplasty", "correct": true },
      { "text": "Centriole", "correct": false },
      { "text": "Biom", "correct": false },
      { "text": "Dendryt", "correct": false }
    ],
    "explanation": "Komórka roślinna posiada ścianę i chloroplasty, ale zazwyczaj brak jej centrioli (typowych dla zwierząt)."
  }
]

```

5. Zapisz plik. **Gotowe!** Aplikacja automatycznie wykryje nowy moduł (może być wymagane odświeżenie strony).

---

## ⚠️ Rozwiązywanie problemów

* **Błąd: `npm` nie jest rozpoznawany**
Upewnij się, że zainstalowałeś Node.js i zrestartowałeś komputer/terminal.
* **Błąd: Aplikacja wygląda "brzydko" (brak kolorów)**
Upewnij się, że po `npm install` uruchomiłeś projekt przez `npm run dev`. Jeśli nadal brak stylów, sprawdź czy pliki `tailwind.config.js` i `postcss.config.js` znajdują się w głównym folderze.
* **Widzę "Tryb Demonstracyjny"**
Oznacza to, że folder `src/modules` jest pusty lub aplikacja nie została uruchomiona przez Vite (`npm run dev`).
