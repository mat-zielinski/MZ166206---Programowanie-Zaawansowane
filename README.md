# Projekt: System Dystrybucji Danych Pogodowych (Klient-Serwer)

## Repozytorium GitHub
Link: https://github.com/mat-zielinski/MZ166206---Programowanie-Zaawansowane

## Autor
Imię i Nazwisko: Mateusz Zieliński 
Nr albumu: 166206
Grupa: Robiłem projekt samodzielnie

---

## Opis Projektu
Aplikacja zrealizowana w architekturze Klient-Serwer przy użyciu **Node.js**. Symuluje system zdalnego odczytu czujników pogodowych. Serwer przechowuje obiekty pomiarowe, a klienci łączą się, aby pobrać dane konkretnego typu. Projekt kładzie nacisk na poprawną obsługę współbieżności, komunikację sieciową oraz radzenie sobie z błędami typów danych.

## Realizacja Wymagań (Elementy Oceny)

### 1. Obiekty i Klasy
W projekcie zdefiniowano wymagane klasy domenowe, każda posiada unikalne pola oraz implementuje metody `toString()` i `equals()`:
*   **`TempReport`**: Przechowuje ID, miasto oraz temperaturę (`val`).
*   **`WindReport`**: Przechowuje ID, miasto oraz prędkość wiatru (`speed`).
*   **`StatusReport`**: Klasa pomocnicza, wykorzystywana również do testowania błędów rzutowania (symulacja otrzymania obiektu nieoczekiwanego typu).

Serwer przy starcie inicjalizuje po 4 instancje każdej klasy i umieszcza je w mapie pod unikalnymi kluczami (format: `NazwaKlasy_Index`).

### 2. Komunikacja Sieciowa
Komunikacja odbywa się warstwie **TCP/IP** przy użyciu surowych gniazd (`net.Socket`).
*   Dane przesyłane są w formacie **JSON**, co pozwala na serializację i deserializację pełnych kolekcji obiektów.
*   Zaimplementowano prosty protokół tekstowy: Klient wysyła nazwę klasy -> Serwer odsyła listę obiektów.

### 3. Wątki i Współbieżność
Serwer obsługuje wielu klientów równocześnie (mechanizm asynchroniczny `Event Loop` w Node.js odpowiada funkcjonalnie obsłudze wielowątkowej).
*   **Limit Klientów**: Zdefiniowano stałą `MAX_CLIENTS = 2`. Każde połączenie powyżej tego limitu otrzymuje status `REFUSED` i jest natychmiast zamykane.
*   **Losowe Opóźnienia**: Dla każdego żądania serwer symuluje losowe opóźnienie (500-1500ms), co pozwala zaobserwować niezależną pracę klientów w czasie rzeczywistym.

### 4. Obsługa Błędów (Rzutowanie)
Zgodnie z wymaganiami, klient weryfikuje typ otrzymanych obiektów.
*   W przypadku, gdy serwer (celowo, na potrzeby testu) przyśle obiekt innej klasy niż żądana (scenariusz `GhostObj`), klient wykrywa niezgodność i zgłasza błąd **`ClassCastException`** na konsoli, nie przerywając przy tym działania aplikacji.

### 5. Obsługa Strumieni Danych
Klient odbiera dane strumieniowo, parsuje je i przetwarza w pętli. Każdy otrzymany obiekt jest wypisywany na konsolę wraz z identyfikatorem klienta, co pozwala śledzić przepływ informacji w tłoku logów systemowych.

---

## Instrukcja Uruchomienia

### Krok 1: Uruchomienie Serwera
Serwer nasłuchuje na porcie 5000.
```bash
node server.js
```

### Krok 2: Uruchomienie Klienta
Można uruchomić wielu klientów w osobnych terminalach, aby przetestować współbieżność:
```bash
node client.js
```
Komendy: `TempReport`, `WindReport`, `GhostObj` (test błędu).