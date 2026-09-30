# 🎨 Design System & Diretrizes UI-UX Pro Max — Dealer Hub

Este documento descreve as diretrizes de design, padrões visuais e regras de experiência do usuário (UX) aplicadas no **Dealer Hub (Banco de Ideias IA)**, baseadas na metodologia **UI-UX Pro Max** ([uupm.cc](https://uupm.cc/)).

---

## 1. Identidade & Filosofia Visual

A identidade visual do projeto segue o conceito **"Grafite & Verde Oficina / Petróleo"**:
- **Tom & Atmosfera**: Profissional, automotivo, moderno e focado em produtividade analítica e IA.
- **Dark-First**: Design planejado primariamente para o modo escuro, com suporte a modo claro via tokens dinâmicos.
- **Elevação Tátil**: Superfícies escuras refinadas com bordas translúcidas sutis (`border-zinc-800/80`) e efeitos de desfoque de vidro (`backdrop-blur`).

---

## 2. Tokens de Design

### 2.1 Cores
| Token | Utilização | Exemplo Tailwind |
| :--- | :--- | :--- |
| **Neutros (Grafite Frio)** | Backgrounds, superfícies e bordas | `bg-zinc-950`, `bg-zinc-900`, `border-zinc-800` |
| **Acento (Verde-Petróleo)** | Botões primários, badges de destaque, status ativos | `bg-blue-600`, `text-blue-400`, `border-blue-500/30` |
| **Sucesso** | Indicadores de status concluído, validações positivas | `text-emerald-400`, `bg-emerald-500/10` |
| **Alerta** | Ideias em análise, pendências | `text-amber-400`, `bg-amber-500/10` |
| **Erro / Crítico** | Exclusão, mensagens de erro | `text-rose-400`, `bg-rose-500/10` |

### 2.2 Tipografia
- **Títulos e Interface (Sans-serif)**: `Archivo` / `Inter` (`font-sans`) para máxima clareza e escaneabilidade em interfaces densas.
- **Dados, Métricas e Códigos (Monospace)**: `IBM Plex Mono` (`font-mono`) para números, IDs, métricas e timestamps.

---

## 3. Padrões de Componentes

### 3.1 Cartões e Contêineres de Ideias
- **Estrutura**: `bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md`
- **Interação**: Efeito hover sutil com `hover:border-zinc-700 hover:shadow-lg transition-all duration-200`
- **Badges**: Pílulas compactas com fonte monoespaçada para categoria e status.

### 3.2 Modais e Drawers
- **Gavetas Laterais (ex: [`NotificationDrawer.tsx`](file:///src/components/layout/NotificationDrawer.tsx))**:
  - Animação de entrada suave pela lateral direita.
  - Backdrop escurecido com desfoque de fundo (`bg-black/60 backdrop-blur-sm`).
  - Suporte completo a navegação por teclado (`Esc` para fechar).

### 3.3 Formulários e Inputs
- **Fundo**: `bg-zinc-900/90 border border-zinc-700/80 text-zinc-100 rounded-xl px-4 py-2.5`
- **Foco Ativo**: `focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none`
- **Placeholder**: `placeholder:text-zinc-500` com bom contraste de legibilidade.

---

## 4. Diretrizes de Microinterações

1. **Feedback Tátil**: Botões com micro-escala no clique (`active:scale-[0.98]`).
2. **Carregamento Fluido**: Uso de skeleton loaders em vez de telas em branco durante chamadas assíncronas.
3. **Notificações**: Toasts e gavetas de aviso com diferenciação imediata de status lido/não-lido e agrupamento cronológico.

---

## 5. Como usar a Skill UI-UX Pro Max com a IA

A skill está configurada no projeto em [`.agents/skills/ui-ux-pro-max/SKILL.md`](file:///.agents/skills/ui-ux-pro-max/SKILL.md).

Sempre que solicitar ajustes de interface, você pode pedir coisas como:
- *"Aplique os padrões da skill UI-UX Pro Max no modal de criação de ideias."*
- *"Refatore a tabela de métricas seguindo o Design System do projeto."*
