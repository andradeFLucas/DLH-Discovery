---
name: ui-ux-pro-max
description: >-
  UI-UX Pro Max design intelligence framework and heuristics. Use whenever designing,
  refining, or reviewing user interfaces, components, micro-interactions, accessibility,
  color harmony, typography scales, layout hierarchies, and UX copywriting.
---

# UI-UX Pro Max Skill & Design Intelligence Framework

O framework **UI-UX Pro Max** fornece diretrizes rigorosas de design, usabilidade, estética visual moderna e padrões de interface para aplicações web de alto impacto.

---

## 1. Princípios Fundamentais de Design

### 1.1 Hierarquia Visual e Escaneabilidade
- **Escala Modular de Tipografia**: Nunca use mais de 3 variações de peso por tela. Mantenha contraste claro entre títulos (h1, h2), subtítulos e textos corridos.
- **Ritmo Vertical & Espaçamento**: Utilize escala consistente de 4px/8px (`gap-2`, `gap-4`, `gap-6`, `gap-8`, `p-4`, `p-6`).
- **Ponto Focal Definido**: Cada viewport ou modal deve ter exatamente **uma** ação primária dominante (CTA).

### 1.2 Paleta de Cores e Contraste
- **Regra 60-30-10**:
  - **60%** Cor dominante neutra (Backgrounds: grafite/slate/zinc).
  - **30%** Cor estrutural (Superfícies de cards, bordas, divisores, inputs).
  - **10%** Cor de destaque/acento (Botões primários, badges de destaque, indicadores ativos).
- **Contraste Acessível (WCAG AA/AAA)**: Razão mínima de contraste de 4.5:1 para texto padrão e 3:1 para elementos gráficos e textos grandes.
- **Dark Mode Nativo**: Em dark mode, evite preto puro (`#000000`) para superfícies grandes; utilize tons profundos (`#101216`, `#191c21`) com elevações graduais em bordas translúcidas (`border-white/10`).

### 1.3 Microinterações e Estados de Feedback
- **Feedback Imediato**: Todo elemento interativo deve possuir estados explícitos: `hover`, `active`, `focus-visible`, `disabled` e `loading`.
- **Transições Suaves**: Utilize transições rápidas (`transition-all duration-150 ease-out` ou `duration-200`) sem atrasos perceptíveis.
- **Estados Vazios & Carregamento**: Nunca deixe a tela vazia sem skeleton loaders ou empty states com ilustrações/ícones e CTAs de ação recomendada.

---

## 2. Padrões de Componentes (Tailwind CSS)

### Botões
- **Primário**: Background de acento vibrante, texto em alto contraste, leve efeito de elevação ou brilho sutil no hover (`hover:brightness-110 active:scale-[0.98]`).
- **Secundário/Ghost**: Fundo sutil ou transparente com borda discreta (`border border-zinc-700 hover:bg-zinc-800/60`).
- **Destrutivo**: Vermelho com transparência no dark mode (`bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20`).

### Cards e Contêineres
- **Glassmorphism Refinado**: `bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-sm`.
- **Hover Dinâmico**: `hover:border-zinc-700 hover:shadow-md transition-all duration-200`.

### Modais e Drawers
- **Backdrop**: `bg-black/60 backdrop-blur-sm animate-in fade-in duration-200`.
- **Acessibilidade**: Foco preso (focus trap), fechamento por tecla `Escape` e clique no overlay.

---

## 3. Checklist de Validação UI-UX Pro Max

Ao criar ou refatorar qualquer componente/página:
1. [ ] A hierarquia visual guia o olhar do usuário naturalmente?
2. [ ] O contraste de cores atende aos padrões de legibilidade?
3. [ ] Os estados interativos (hover, active, disabled, focus) estão implementados?
4. [ ] Há feedback visual claro para ações assíncronas (loading, salvamento, erros)?
5. [ ] O layout é responsivo e mantém usabilidade perfeita em mobile, tablet e desktop?
6. [ ] A tipografia monoespaçada é reservada para métricas, códigos e dados numéricos?
7. [ ] Os textos e rótulos são diretos, claros e em tom profissional e amigável?
