# UBC-Navigate Design System

## Overview

UBC-Navigate is a clean, minimal, and highly professional social application. Taking strong cues from leading social platforms like Instagram, the UI focuses intensely on content and connection by pulling back the interface. 

The aesthetic is "Calm Blue": stark whites, deep blacks, subtle grays for borders, and a vibrant yet reassuring blue for primary actions. 

We strictly avoid "AI-generated" aesthetics (no excessive gradients, neon colors, or emoji-heavy UI). We use crisp `@expo/vector-icons` instead of native text emojis to ensure a consistent, professional look across all devices.

---

## Colors

The palette is highly restrained to create a stark, professional canvas.

- **Primary Text** (#111827): Deep almost-black for all primary text and strong headers.
- **Secondary Text** (#6B7280): Mid-gray for secondary information and subtitles.
- **Calm Blue Accent** (#007AFF): The single vibrant color. Used for links, primary buttons, and active states (mimicking iOS System Blue).
- **Background** (#FFFFFF): Pure white for app backgrounds.
- **Surface Layer** (#F9FAFB): Very subtle off-white for secondary cards or input fields.
- **Borders** (#E5E7EB): Soft, clean lines for separating content without heavy shadows.
- **Success** (#34C759): Confirmed actions (iOS Green).
- **Error** (#FF3B30): Destructive actions (iOS Red).

## Typography

Fonts use the standard Google Fonts provided, but with a stricter monochrome hierarchy.

- **Headline Font**: Plus Jakarta Sans
- **Body Font**: DM Sans
- **Mono Font**: Fira Code

- **H1**: Plus Jakarta Sans 26px bold, 1.2 line height
- **H2**: Plus Jakarta Sans 22px bold, 1.25 line height
- **H3**: Plus Jakarta Sans 18px semibold, 1.3 line height
- **H4**: Plus Jakarta Sans 16px medium, 1.35 line height
- **Body**: DM Sans 15px regular, 1.5 line height
- **Body SM**: DM Sans 14px regular, 1.5 line height
- **Caption**: DM Sans 12px medium, 1.4 line height

## Layout & Components

- **Spacing**: 8px grid system.
  - `xs`: 4px
  - `sm`: 8px
  - `md`: 16px
  - `lg`: 24px
  - `xl`: 32px

- **Corners**: Subtle and professional.
  - `sm`: 4px
  - `md`: 8px (default for cards/buttons)
  - `lg`: 12px
  - `full`: 9999px (pills and avatars)

- **Cards**: Flat design. White backgrounds with a 1px `#E5E7EB` border. *Do not use heavy drop shadows.*
- **Buttons**:
  - `Primary`: Solid `#007AFF` background, White text.
  - `Secondary`: `#F9FAFB` background, `#111827` text, `#E5E7EB` border.
  - `Outline`: Transparent background, `#007AFF` border and text.
  - `Ghost`: Transparent background, `#6B7280` text (no border).

## Iconography & Emojis

**Rule:** Do not use native emojis.
We use vector icons (specifically `Ionicons` or `Feather` from `@expo/vector-icons`). Icons should generally match the text color they accompany (e.g., `#111827` for headers, `#6B7280` for metadata) or `#007AFF` for interactive elements.
