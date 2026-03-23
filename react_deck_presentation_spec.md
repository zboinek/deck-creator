# Budowa aplikacji do prezentacji w czystym Next.js / React

Ten dokument opisuje, jak od podstaw zbudować system prezentacji (deck) wykorzystujący wyłącznie Reacta, Next.js i TailwindCSS (bez zewnętrznych bibliotek pokroju Reveal.js czy Spectacle) oraz jak dodać do niego funkcję "Eksportu do PDF" opartą o natywne mechanizmy przeglądarki.

## 1. Architektura systemu

Całość oparta jest na kilku prostych elementach:
1. **Pojedyncze komponenty slajdów** (np. [SlideMission](file:///Users/Jakub.Zboina/dev/archipro/app/founder-deck/deck.tsx#18-34), [SlideRoles](file:///Users/Jakub.Zboina/dev/archipro/app/founder-deck/deck.tsx#241-274)), które hermetyzują treść danego ekranu.
2. **Komponent [SlideShell](file:///Users/Jakub.Zboina/dev/archipro/app/founder-deck/deck.tsx#7-17)**, który służy jako tło/układ (layout) dla każdego slajdu (np. dodaje paginację w rogu).
3. **Główny kontroler [Deck](file:///Users/Jakub.Zboina/dev/archipro/app/founder-deck/deck.tsx#325-422)**, który trzyma w stanie (`useState`) informację o aktualnym slajdzie, obsługuje klawiaturę (strzałki, spacja) i renderuje odpowiedni widok (zwykły lub do druku).

## 2. Podstawowa struktura slajdu i szkieletu (SlideShell)

Tworzymy uniwersalny wrapper na zawartość każdego slajdu. Dba on o odpowiednie wyśrodkowanie i np. wyświetla numer strony.

```tsx
// components/SlideShell.tsx
export function SlideShell({ children, current, total }: { children: React.ReactNode; current: number; total: number }) {
    return (
        <div className="relative w-full h-full flex flex-col justify-center items-center px-16 py-12 bg-white text-black">
            {/* Tutaj właściwa zawartość slajdu */}
            {children}
            
            {/* Paginacja na dole ekranu */}
            <span className="absolute bottom-6 right-8 text-xs font-mono text-gray-400">
                {current} / {total}
            </span>
        </div>
    )
}
```

Następnie tworzymy konkretne slajdy:

```tsx
// components/slides/WelcomeSlide.tsx
export function WelcomeSlide() {
    return (
        <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold">Nasza Prezentacja</h1>
            <p className="text-xl text-gray-500">Zbudowana w czystym React</p>
        </div>
    )
}
```

## 3. Główny komponent zarządzający (Deck) i obsługa Eksportu do PDF

Aplikacja musi obsłużyć dwa tryby:
* **Prezentacja (Interactive):** Renderuje tylko jeden slajd naraz. Posiada paski nawigacji i nasłuchuje na zdarzenia z klawiatury.
* **Do druku (Print View):** Renderuje wszystkie slajdy jeden pod drugim, ukrywa paski narzędzi, a CSS dba o to, aby każdy slajd był na oddzielnej kartce papieru (PDF).

W Next.js (App Router) możemy użyć `useSearchParams`, aby sprawdzić, czy chcemy renderować tryb do druku (`?print=true`).

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { SlideShell } from './SlideShell'
import { WelcomeSlide } from './slides/WelcomeSlide'
// import { OtherSlide } from './slides/OtherSlide'

// 1. Zdefiniuj wszystkie slajdy w tablicy
const SLIDES = [
    WelcomeSlide,
    // OtherSlide,
    // ...
]

export function DeckPresentation() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    
    // Sprawdzamy, czy jesteśmy w trybie druku (np. my-domain.com/deck?print=true)
    const isPrinting = searchParams.get('print') === 'true'

    // Stan bieżącego slajdu
    const [current, setCurrent] = useState(0)

    // Funkcje do nawigacji
    const next = useCallback(() => setCurrent(c => Math.min(c + 1, SLIDES.length - 1)), [])
    const prev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), [])

    // Obsługa klawiatury
    useEffect(() => {
        if (isPrinting) return // Nie potrzebujemy nawigacji w trybie druku

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
            if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [next, prev, isPrinting])

    const CurrentSlideComponent = SLIDES[current]

    // Funkcja odpalająca drukowanie
    const handlePrintRequest = () => {
        // Dodajemy flagę ?print=true do urla
        const params = new URLSearchParams(searchParams.toString())
        params.set('print', 'true')
        router.push(pathname + '?' + params.toString())
    }

    // Jeśli wejdziemy ze zmienionym URL na tryb print, wymuszamy okno drukowania
    useEffect(() => {
        if (isPrinting) {
            // Dajemy chwilę na wyrenderowanie wszystkich obrazków/DOM, zanim otworzymy okno dialogowe
            const timeoutId = setTimeout(() => {
                window.print()
            }, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [isPrinting])

    // ==============================================
    // RENDEROWANIE W TRYBIE DRUKOWANIA (PDF EXPORT)
    // ==============================================
    if (isPrinting) {
        return (
            <div className="print-mode flex flex-col bg-white">
                {SLIDES.map((SlideComponent, index) => (
                    // height: 100vh oraz relative na pojedynczy kontener utrzymują aspekt ekranu podczas druku
                    <div key={index} className="print-slide h-screen w-screen relative overflow-hidden break-after-page">
                        <SlideShell current={index + 1} total={SLIDES.length}>
                            <SlideComponent />
                        </SlideShell>
                    </div>
                ))}
                
                {/* Style niezbędne dla druku PDF w poziomie */}
                <style jsx global>{`
                    @media print {
                        @page {
                            size: landscape;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        /* Opcjonalnie: upewnienie się, że element ma nakazany break */
                        .break-after-page {
                            page-break-after: always;
                            break-after: page;
                        }
                        /* Ukrywamy nagłówki i stopki wstrzykiwane przez przeglądarkę */
                        @page {
                            margin: 0cm;
                        }
                    }
                `}</style>
            </div>
        )
    }

    // ==============================================
    // RENDEROWANIE STANDARDOWE KLIENCKIE (INTERAKTYWNE)
    // ==============================================
    return (
        <div className="fixed inset-0 bg-gray-900 text-white flex flex-col">
            {/* Górny pasek */}
            <div className="flex justify-between items-center p-4 bg-gray-800">
                <span className="font-bold">Moja Prezentacja</span>
                <button 
                    onClick={handlePrintRequest} 
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                    Zapisz jako PDF
                </button>
            </div>

            {/* Obszar slajdu */}
            <div className="flex-1 overflow-hidden relative">
                <SlideShell current={current + 1} total={SLIDES.length}>
                    <CurrentSlideComponent />
                </SlideShell>
            </div>

            {/* Dolny pasek nawigacji */}
            <div className="flex justify-between p-4 bg-gray-800 text-gray-400">
                <button onClick={prev} disabled={current === 0}>← Poprzedni</button>
                <button onClick={next} disabled={current === SLIDES.length - 1}>Następny →</button>
            </div>
        </div>
    )
}
```

## 4. Kluczowe punkty implementacji (Złote reguły CSS)

Skuteczność tworzenia "powerpointowego" PDF leży wyłącznie w prawidłowym obsłużeniu tzw. `Print Media CSS`. 
Jeśli PDF źle się docina lub dzieli na innych slajdach, winne za to jest ignorowanie poniższych właściwości:

* `@page { size: landscape; margin: 0; }` - Wymusza od razu ustawienie poziome w przeglądarce i usuwa białe obramowanie.
* `-webkit-print-color-adjust: exact;` (często konfigurowane w Tailwindzie jako klasa `print:exact-colors`) - Sprawia, że przeglądarka wydrukuje tła we wszystkich elementach i nie ukryje np. wypełnionych pasków postępu czy zakolorowanych divów.
* `page-break-after: always;` / `break-after: page;` - Bezwzględnie nakazujemy systemowi obcięcie strony po danym bloku. Blok musi mieć stałą wysokość `100vh` żeby precyzyjnie wypełnić jedną kartkę A4 na szerokość.

## Podsumowanie workflow użytkownika podczas eksportu:

1. Użytkownik klika: "Zapisz jako PDF".
2. Aplikacja przeładowuje ścieżkę dokładając do niej `?print=true`.
3. Komponent czyta to i natychmiast zamienia widok na ciągłe zestawienie _wszystkich_ slajdów.
4. Uruchamia się `window.print()`, co wywołuje systemowe/przeglądarkowe menu opcji drukowania układając slajdy horyzontalnie na oddzielnych kartkach.
5. Użytkownik z menu przeglądarki klika "Zapisz do PDF" i zachowuje na dysk prezentację w idealnej jakości.
