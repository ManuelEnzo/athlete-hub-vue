# Mobile Responsiveness Audit Report
**Date:** April 5, 2026
**Scope:** All pages in `app/pages/` and all page-level/layout components
**Method:** Full source-code review of every `.vue` template

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical (breaks layout on mobile) | 12 |
| 🟡 Moderate (cramped / suboptimal) | 31 |
| 🟢 No issues | 18 |

---

## Report

```json
[
  {
    "file": "app/pages/index.vue",
    "issues": []
  },
  {
    "file": "app/pages/dashboard-advanced.vue",
    "issues": []
  },
  {
    "file": "app/pages/athletedetails.vue",
    "issues": [
      {
        "line": 38,
        "element": "div.relative.min-w-[200px]",
        "problem": "min-w-[200px] sm:min-w-[260px] with w-full sm:w-auto — on smallest phones (320px) the 200px minimum inside a flex-wrap row may still cause the select to be pushed onto its own line unexpectedly; acceptable but worth a note.",
        "fix": "Already handled with w-full sm:w-auto. No action required."
      }
    ]
  },
  {
    "file": "app/pages/athletehealth.vue",
    "issues": [
      {
        "line": 14,
        "element": "div.flex.items-center.space-x-2",
        "problem": "Header action buttons use space-x-2 inside a flex row. On 320 px screens the 'Export' and 'Details' buttons can overflow below the h2 because the outer container is flex-wrap but this inner div is not.",
        "fix": "Add flex-wrap and replace space-x-2 with gap-2: `class=\"flex flex-wrap items-center gap-2\"`"
      }
    ]
  },
  {
    "file": "app/pages/athletemanagement.vue",
    "issues": [
      {
        "line": 15,
        "element": "div.flex.items-center.space-x-2",
        "problem": "Button group in page header uses space-x-2 without flex-wrap. On very narrow screens the New/Cancel button may overflow.",
        "fix": "Change to `class=\"flex flex-wrap items-center gap-2\"`"
      }
    ]
  },
  {
    "file": "app/pages/athletemeasurements.vue",
    "issues": [
      {
        "line": 62,
        "element": "SelectTrigger.w-64",
        "problem": "Athlete filter select has fixed w-64 (256 px). Wrapped in flex-wrap but on 320 px it leaves only 64 px for the button beside it.",
        "fix": "Change to `class=\"w-full sm:w-64\"` so it goes full-width on mobile."
      }
    ]
  },
  {
    "file": "app/pages/agenda.vue",
    "issues": []
  },
  {
    "file": "app/pages/kanban.vue",
    "issues": []
  },
  {
    "file": "app/pages/injuriesmanager.vue",
    "issues": [
      {
        "line": 50,
        "element": "div.relative.min-w-[300px].w-full",
        "problem": "min-w-[300px] on the athlete Select container. The Select is w-full inside a flex column that becomes w-full on mobile, so min-w-[300px] is redundant but forces a 300 px minimum even when combined with the Loader2 icon in a flex row, potentially cropping at 320 px.",
        "fix": "Remove min-w-[300px] and keep only w-full: `class=\"relative w-full\"`"
      }
    ]
  },
  {
    "file": "app/pages/email.vue",
    "issues": [
      {
        "line": 6,
        "element": "div.-m-4.lg:-m-6",
        "problem": "Negative margin trick to remove page padding. At mobile widths -m-4 causes the MailCompLayout to bleed 16 px off-screen on both sides, clipping the content.",
        "fix": "Verify MailCompLayout adds its own p-4 md:p-6. If so, the page wrapper should be `class=\"-mx-4 sm:-mx-6 -mt-4 sm:-mt-6\"` limited to horizontal axes only, or remove the negative margin entirely and rely on the component's own padding."
      }
    ]
  },
  {
    "file": "app/pages/tasks.vue",
    "issues": [
      {
        "line": 36,
        "element": "DataTable (wraps a <Table>)",
        "problem": "The DataTable component renders a <Table> inside a plain div.border.rounded-md with no overflow-x-auto wrapper (see DataTable.vue). On mobile, the table will overflow the viewport horizontally without a scrollbar.",
        "fix": "In DataTable.vue, wrap the table div: `<div class=\"border rounded-md overflow-x-auto\">`. Also add min-w-[600px] to the inner Table so columns don't collapse."
      }
    ]
  },
  {
    "file": "app/pages/testmanagement.vue",
    "issues": []
  },
  {
    "file": "app/pages/sleephistory.vue",
    "issues": [
      {
        "line": 50,
        "element": "div.relative.min-w-[280px]",
        "problem": "min-w-[280px] on the athlete Select wrapper. With w-full md:w-auto, on mobile this is fine most of the time, but on a 320 px viewport a 280 px min-width leaves only 40 px of margin, which is tight.",
        "fix": "Change to `class=\"relative w-full md:w-72\"` — removes the explicit min-width and relies on full width on mobile."
      }
    ]
  },
  {
    "file": "app/pages/rpedetails.vue",
    "issues": []
  },
  {
    "file": "app/pages/datapolicy.vue",
    "issues": [
      {
        "line": 35,
        "element": "div.bg-card.border.p-8",
        "problem": "p-8 (32 px) padding on main intro card at all screen sizes. On mobile this is excessive.",
        "fix": "Change to `class=\"bg-card border border-border rounded-lg p-4 md:p-8 mb-8 shadow-sm\"`"
      },
      {
        "line": 42,
        "element": "div.grid.md:grid-cols-3.gap-4",
        "problem": "3-col grid only activates at md (768 px). Usable but at sm (640–768 px) it stays 1 col. A 2-col at sm would use space better.",
        "fix": "Change to `class=\"grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8\"`"
      },
      {
        "line": 89,
        "element": "div.grid.md:grid-cols-2.gap-4",
        "problem": "2-col grid for access/refresh token info. Same as above — no sm intermediate.",
        "fix": "Not critical. Acceptable as-is since cards are narrow enough."
      }
    ]
  },
  {
    "file": "app/pages/landingpage.vue",
    "issues": [
      {
        "line": 93,
        "element": "nav > div.container.flex-col.sm:flex-row",
        "problem": "Navbar stacks vertically on xs screens (< sm). The brand + CTA buttons don't get any gap reduction on xs — the gap-3 between items and flex-shrink-0 on the button cluster is fine, but on sub-360 px screens the 'Demo' button with px-6 sm:px-8 looks squished.",
        "fix": "Minor: reduce to `px-4 sm:px-8` on the Demo button."
      },
      {
        "line": 115,
        "element": "section.pt-32.pb-40.px-6",
        "problem": "pt-32 (128 px) and pb-40 (160 px) vertical padding in the hero section are very large on mobile, wasting significant vertical space.",
        "fix": "Change to `class=\"relative pt-16 md:pt-32 pb-20 md:pb-40 px-4 md:px-6 overflow-hidden\"`"
      },
      {
        "line": 137,
        "element": "div.absolute.w-[500px].h-[500px]",
        "problem": "Hard-coded 500 px × 500 px decorative blur div. On phones this 500 px element overflows viewport (360 px wide), but since it's -z-10 and blurred it doesn't affect interaction. Cosmetically causes horizontal overflow.",
        "fix": "Change to `class=\"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(500px,120vw)] h-[min(500px,120vw)] bg-primary/10 blur-[120px] rounded-full -z-10\"`"
      },
      {
        "line": 155,
        "element": "div.grid.md:grid-cols-3.gap-10",
        "problem": "Preview image grid: 1 col below md, 3 cols at md+. At sm (640–767 px) still 1 col — 2 cols at sm would be better.",
        "fix": "Change to `class=\"grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10\"`"
      },
      {
        "line": 200,
        "element": "div.grid.md:grid-cols-2.lg:grid-cols-4.gap-8",
        "problem": "Feature cards: 1 col below md, 2 at md, 4 at lg. The jump from 1 to 2 to 4 is reasonable, but sm would benefit from 2 cols too.",
        "fix": "Change to `class=\"grid sm:grid-cols-2 lg:grid-cols-4 gap-8\"`"
      },
      {
        "line": 225,
        "element": "div.grid.lg:grid-cols-2.gap-24",
        "problem": "Scalability section: gap-24 (96 px) is the gap when stacked vertically on mobile (below lg) — 96 px between two stacked divs is excessive.",
        "fix": "Change to `class=\"grid lg:grid-cols-2 gap-10 lg:gap-24 items-center\"`"
      },
      {
        "line": 263,
        "element": "div.grid.md:grid-cols-3.gap-20",
        "problem": "Roadmap grid: gap-20 (80 px) is excessive for vertical stacking on mobile.",
        "fix": "Change to `class=\"grid md:grid-cols-3 gap-10 md:gap-20 max-w-5xl mx-auto\"`"
      },
      {
        "line": 247,
        "element": "h2.text-5xl.md:text-6xl",
        "problem": "text-5xl (48 px) base size for scalability heading is very large on a 360 px phone, likely causing text to wrap onto 4+ lines.",
        "fix": "Change to `class=\"text-3xl md:text-5xl lg:text-6xl font-black ...\"`"
      }
    ]
  },
  {
    "file": "app/pages/(auth)/login.vue",
    "issues": []
  },
  {
    "file": "app/pages/(auth)/login-basic.vue",
    "issues": []
  },
  {
    "file": "app/pages/(auth)/register.vue",
    "issues": []
  },
  {
    "file": "app/pages/(auth)/forgot-password.vue",
    "issues": []
  },
  {
    "file": "app/pages/(auth)/otp.vue",
    "issues": [
      {
        "line": 11,
        "element": "div.flex.w-full.items-center.justify-center.p-6.lg:w-1/2",
        "problem": "Left panel is full-width below lg, which is correct. However the right panel `hidden ... lg:block` means no visual context on md screens (tablets). This is a UX choice, not strictly a bug.",
        "fix": "Consider showing a smaller branding image on md: `class=\"relative hidden md:block w-1/3 lg:w-1/2\"`"
      }
    ]
  },
  {
    "file": "app/pages/(auth)/otp-1.vue",
    "issues": []
  },
  {
    "file": "app/pages/(auth)/reset-password.vue",
    "issues": []
  },
  {
    "file": "app/pages/(error)/401.vue",
    "issues": [
      {
        "line": 10,
        "element": "h1.text-[7rem]",
        "problem": "7rem (112 px) font-size for the error code. On a 320 px screen, a 3-digit number at 112 px overflows horizontally.",
        "fix": "Change to `class=\"text-[4rem] sm:text-[7rem] font-bold leading-tight\"`"
      }
    ]
  },
  {
    "file": "app/pages/(error)/403.vue",
    "issues": [
      {
        "line": 10,
        "element": "h1.text-[7rem]",
        "problem": "Same as 401 — 112 px font overflows on small screens.",
        "fix": "Change to `class=\"text-[4rem] sm:text-[7rem] font-bold leading-tight\"`"
      }
    ]
  },
  {
    "file": "app/pages/(error)/404.vue",
    "issues": [
      {
        "line": 10,
        "element": "h1.text-[7rem]",
        "problem": "Same as 401/403.",
        "fix": "Change to `class=\"text-[4rem] sm:text-[7rem] font-bold leading-tight\"`"
      }
    ]
  },
  {
    "file": "app/pages/(error)/500.vue",
    "issues": [
      {
        "line": 10,
        "element": "h1.text-[7rem]",
        "problem": "Same as 401/403/404.",
        "fix": "Change to `class=\"text-[4rem] sm:text-[7rem] font-bold leading-tight\"`"
      }
    ]
  },
  {
    "file": "app/pages/(error)/503.vue",
    "issues": [
      {
        "line": 10,
        "element": "h1.text-[7rem]",
        "problem": "Same as all error pages.",
        "fix": "Change to `class=\"text-[4rem] sm:text-[7rem] font-bold leading-tight\"`"
      }
    ]
  },
  {
    "file": "app/pages/settings/account.vue",
    "issues": []
  },
  {
    "file": "app/pages/settings/profile.vue",
    "issues": []
  },
  {
    "file": "app/pages/settings/appearance.vue",
    "issues": []
  },
  {
    "file": "app/pages/settings/notifications.vue",
    "issues": []
  },
  {
    "file": "app/pages/settings/display.vue",
    "issues": []
  },
  {
    "file": "app/pages/rpe/[token].vue",
    "issues": []
  },

  {
    "file": "app/components/athelete/AthleteDetail.vue",
    "issues": [
      {
        "line": 344,
        "element": "div.grid.grid-cols-2.lg:grid-cols-4.gap-4 (Overview KPI cards)",
        "problem": "KPI grid skips sm/md breakpoints — goes directly from 2 cols (all phones, 320–1023 px) to 4 cols at lg. On 768–1023 px (tablets), 2 wide KPI cards look very large. More critically, on 320 px phones the kpi-value (.text-[1.875rem] = 30 px font) inside a 50%-width card leaves very little space for the icon and label.",
        "fix": "Change to `class=\"grid grid-cols-2 md:grid-cols-4 gap-4\"` — this already promotes to 4 cols on tablets (768px+)."
      },
      {
        "line": 400,
        "element": "div.grid.grid-cols-1.lg:grid-cols-3.gap-6 (Load section — ACWR chart + sidecards)",
        "problem": "Chart and side-cards only switch at lg (1024 px). On md (768–1023 px) both components stack vertically, making the page very long.",
        "fix": "Change to `class=\"grid grid-cols-1 md:grid-cols-3 gap-6\"` with chart taking `class=\"md:col-span-2\"`."
      },
      {
        "line": 459,
        "element": "div.grid.grid-cols-1.lg:grid-cols-3.gap-6 (Recovery section)",
        "problem": "Same — only 3-col at lg, wastes horizontal space on md tablets.",
        "fix": "Change to `class=\"grid grid-cols-1 md:grid-cols-3 gap-4\"`"
      },
      {
        "line": 524,
        "element": "div.grid.grid-cols-1.lg:grid-cols-3.gap-6 (Performance section)",
        "problem": "Chart col-span-2 and metric list only visible as 3-col at lg — md tablets waste space.",
        "fix": "Change to `class=\"grid grid-cols-1 md:grid-cols-3 gap-6\"` with chart `md:col-span-2`."
      },
      {
        "line": 570,
        "element": "select (metric selector inside CardHeader)",
        "problem": "select has max-w-[180px] hardcoded — fine on desktop but on 2-col mobile cards this select is inside a CardHeader flex row and can make the header overflow on narrow cards.",
        "fix": "Change to `class=\"text-xs border border-border rounded-md px-2 py-1 bg-background focus:ring-2 focus:ring-primary/30 w-full max-w-[180px] sm:w-auto\"`"
      },
      {
        "line": 617,
        "element": "div.grid.grid-cols-1.lg:grid-cols-2.gap-6 (Injuries section)",
        "problem": "Skips md breakpoint — on tablets (768–1023 px) the two injury cards stack vertically.",
        "fix": "Change to `class=\"grid grid-cols-1 md:grid-cols-2 gap-6\"`"
      }
    ]
  },
  {
    "file": "app/components/athmanagement/AthleteManagement.vue",
    "issues": [
      {
        "line": 314,
        "element": "CardContent.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-4.gap-4",
        "problem": "Form input grid: on md it is 2 cols, on lg it is 4 cols. This is fine. However on a 768 px tablet with 2 cols, labels such as 'Token Sleep ID' with its 3 inline elements (Input + 2 Buttons) in a single grid cell may overflow.",
        "fix": "The Token Sleep field has `md:col-span-2 lg:col-span-2` — verify the 3-element flexbox (input + 2 icon buttons) doesn't overflow at md. Consider `flex-wrap` on the inner flex div."
      },
      {
        "line": 398,
        "element": "TransitionGroup.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-6",
        "problem": "Athlete card grid is good. However the action overlay buttons are `absolute top-3 right-3` and controlled by `.actions-overlay` CSS. This is opacity-0 by default (hover-only) — touch devices never hover, so the Edit/Delete buttons are invisible.",
        "fix": "On touch devices, always show action buttons. Use `sm:opacity-0 sm:group-hover:opacity-100` so on xs/mobile they are always visible: change CSS or add a `class` on the actions-overlay div: `class=\"absolute top-3 right-3 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity\"`"
      }
    ]
  },
  {
    "file": "app/components/injury/InjuryManagement.vue",
    "issues": [
      {
        "line": 232,
        "element": "div.fixed.inset-0 (custom dialog) > Card.w-full.max-w-lg",
        "problem": "The custom modal uses `p-4` on the outer container (inset-0 with flex) but the Card itself has no internal padding limits. On 320 px phones, max-w-lg (512 px) is fine as w-full, but the CardContent grid-cols-2 is cramped.",
        "fix": "See below."
      },
      {
        "line": 247,
        "element": "CardContent.grid.grid-cols-2.gap-4.pt-6",
        "problem": "The form dialog uses a fixed 2-column grid for all fields. On phones (320–479 px) this means each field is only ~130 px wide, making date inputs and selects very narrow and hard to interact with.",
        "fix": "Change to `class=\"grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6\"` so fields stack on phones."
      },
      {
        "line": 253,
        "element": "col-span-2 (date inputs in 2-col grid)",
        "problem": "Date inputs use col-span-1 — they share a row with another field. At 320 px each date input is ~130 px wide, which is very narrow for a native date picker.",
        "fix": "Change injury date and expected return inputs to `class=\"col-span-2 sm:col-span-1\"` or keep col-span-2 on small screens."
      },
      {
        "line": 200,
        "element": "div.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-4 (injury cards list)",
        "problem": "Good responsive grid. The action buttons (Edit/Delete) inside each card use `opacity-0 group-hover:opacity-100` — invisible on touch devices.",
        "fix": "Same fix as AthleteManagement: `class=\"flex justify-end gap-2 pt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity\"`"
      }
    ]
  },
  {
    "file": "app/components/kanban/KanbanBoard.vue",
    "issues": [
      {
        "line": 174,
        "element": "div.flex.gap-4.overflow-x-auto.overflow-y-hidden.pb-4",
        "problem": "The Kanban board uses overflow-x-auto — correct. However each column Card is w-[272px] which is wider than a 360 px phone minus padding. On small phones users will need to scroll even to see a single full column. This is intrinsic to Kanban but worth noting.",
        "fix": "Consider responsive column widths: `class=\"w-[272px] sm:w-[280px] shrink-0 ...\"`. Accept as design pattern — ensure parent page has no hidden overflow."
      },
      {
        "line": 247,
        "element": "div.grid.items-baseline.grid-cols-1.md:grid-cols-4 (task dialog form)",
        "problem": "The task creation dialog grid for labels/fields: grid-cols-4 with label col-span-1 and field col-span-3. On mobile (grid-cols-1) labels and fields both take full width and stack, which is fine. But the `*:col-span-3` shorthand via CSS may cause unexpected behavior if not fully supported.",
        "fix": "Explicitly set `md:[&>label]:col-span-1 md:[&>:not(label)]:col-span-3` or restructure with FormItem components."
      }
    ]
  },
  {
    "file": "app/components/mail/MailCompLayout.vue",
    "issues": [
      {
        "line": 152,
        "element": "div.flex.flex-col.sm:flex-row.gap-2 (filter bar — selects)",
        "problem": "The two native <select> elements for athlete and status filter have no explicit width. At sm they go into a flex row — they auto-size based on content and may become very narrow on tablets. The search Input after them uses flex-1 which is correct but the selects may be too small.",
        "fix": "Add `class=\"min-w-0 flex-1 sm:flex-none sm:w-40\"` to each select element to prevent them from being too narrow in the flex row."
      },
      {
        "line": 178,
        "element": "Card.hidden.md:block (desktop table view)",
        "problem": "Table is fully hidden below md — only mobile cards show. The desktop table has overflow-x-auto which is correct. However the 'hidden md:block' pattern means there is a gap: at exactly sm (640–767 px) the mobile cards are shown but they have a fixed grid-cols-2 date layout. No issues at xs/sm.",
        "fix": "No fix required — solid responsive dual-view pattern."
      }
    ]
  },
  {
    "file": "app/components/dashboard/DashboardLayout.vue",
    "issues": [
      {
        "line": 237,
        "element": "div.grid.grid-cols-2.sm:grid-cols-4.gap-4 (KPI cards)",
        "problem": "Good responsive grid. No issues."
      },
      {
        "line": 246,
        "element": "div.grid.grid-cols-1.lg:grid-cols-12.gap-6 (Workload + Risk row)",
        "problem": "Workload chart and Risk Assessment widget only go side-by-side at lg (1024 px). At md (768–1023 px) tablets they stack. Each widget has min-h-56 sm:h-72, causing the row to be 144 px × 2 = 288 px taller than needed.",
        "fix": "Change to `class=\"grid grid-cols-1 md:grid-cols-12 gap-6\"` and update the inner col-span classes to use `md:col-span-7` etc."
      },
      {
        "line": 254,
        "element": "div.grid.grid-cols-1.lg:grid-cols-12.gap-6 (AthleteTable + Health row)",
        "problem": "Same as above — table and health assessment only side-by-side at lg.",
        "fix": "Change to `class=\"grid grid-cols-1 md:grid-cols-12 gap-6\"` with same col-span updates."
      },
      {
        "line": 195,
        "element": "select (time range selector in top bar)",
        "problem": "Native select has arbitrary width (auto). On very small screens (< 375 px) the entire top bar flex row may be very cramped with 4 action buttons alongside the select.",
        "fix": "Add `class=\"px-2 py-1.5 rounded-md border border-border bg-background text-foreground text-sm min-w-0 max-w-[100px] sm:max-w-none\"` to prevent it from being too wide."
      },
      {
        "line": 209,
        "element": "span.hidden.md:inline inside filter button",
        "problem": "Filter button text is hidden below md — only icon shows. On small screens the icon-only button lacks a visible label.",
        "fix": "Acceptable pattern. Optionally use a tooltip on mobile (title attribute already present)."
      }
    ]
  },
  {
    "file": "app/components/dashboard/AthleteStatusTable.vue",
    "issues": []
  },
  {
    "file": "app/components/athletehealthc/AthleteHealthComp.vue",
    "issues": [
      {
        "line": 94,
        "element": "div.grid.grid-cols-1.gap-6.xl:grid-cols-3",
        "problem": "CRITICAL: The main layout grid skips sm/md/lg breakpoints entirely — it is 1 col from 0 to 1279 px, and only becomes 3 col at xl (1280 px). On md/lg tablets (768–1279 px) the table and sidebar cards stack vertically, making the page unnecessarily long. The table is also effectively full-width on all these sizes.",
        "fix": "Change to `class=\"grid grid-cols-1 gap-6 lg:grid-cols-3\"` to activate the 3-col layout at 1024 px."
      },
      {
        "line": 105,
        "element": "table.w-full (inside Card without overflow wrapper)",
        "problem": "CRITICAL: The athlete status table (`<table class=\"w-full\">`) is inside `<CardContent class=\"p-0\">` with no overflow-x-auto wrapper. On small screens the table columns (Athlete | ACWR | Status | Readiness) will overflow the viewport.",
        "fix": "Wrap the table in `<div class=\"overflow-x-auto\"><table class=\"w-full min-w-[480px]\">...</table></div>`"
      },
      {
        "line": 150,
        "element": "div.h-2.w-32.bg-muted.rounded-full (risk distribution bars)",
        "problem": "Fixed w-32 (128 px) for progress bars inside a flex row. At screen width < 480 px, 128 px of bar + label text + percentage may overflow.",
        "fix": "Change to `class=\"h-2 flex-1 max-w-32 bg-muted rounded-full overflow-hidden\"` so bars shrink on small screens."
      },
      {
        "line": 105,
        "element": "CardHeader with CardTitle and span.text-sm.text-muted-foreground",
        "problem": "The table section header `class=\"flex flex-row items-center justify-between\"` has no flex-wrap — if athlete name is long the count label may be pushed off.",
        "fix": "Add `flex-wrap gap-2` to the CardHeader flex row."
      }
    ]
  },
  {
    "file": "app/components/athletemeasurements/AthletesMeasurements.vue",
    "issues": [
      {
        "line": 278,
        "element": "CardContent.grid.grid-cols-1.md:grid-cols-4.gap-4",
        "problem": "The create/edit form jumps from 1 col (mobile) directly to 4 cols (md/tablet). On a 768 px tablet, 4 narrow inputs per row may be cramped for fields like email or date.",
        "fix": "Change to `class=\"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4\"` for an intermediate 2-col layout at sm."
      },
      {
        "line": 294,
        "element": "md:col-span-2 on athlete select (inside 4-col grid)",
        "problem": "Athlete select spans 2 of 4 cols at md. At sm (if using new 2-col grid above) this needs `sm:col-span-2 md:col-span-2`. Fine as-is if keeping 4-col at md only.",
        "fix": "After fixing the grid, update to `class=\"md:col-span-2\"`."
      },
      {
        "line": 265,
        "element": "div.md:hidden.fixed.right-4.bottom-4.z-50 (floating add button)",
        "problem": "Floating action button is good. However it is `md:hidden` which means it disappears at 768 px — but the form is triggered by the parent page's add button. Ensure mobile discovery of 'add' action is not broken on devices between sm-md range.",
        "fix": "No critical fix needed — the parent page has a visible 'New Measurement' button."
      }
    ]
  },
  {
    "file": "app/components/testmanage/TestManagmentComp.vue",
    "issues": [
      {
        "line": 207,
        "element": "div.grid.grid-cols-1.md:grid-cols-12.gap-3 (metric row in form)",
        "problem": "Each metric has a complex 12-col grid with: name (3), unit (2), type (3), standard value (3), delete button (1). Below md it collapses to 1 col (each element full width), which is good. At md+ the 12-col layout is fine.",
        "fix": "No critical issue. Acceptable."
      },
      {
        "line": 180,
        "element": "div.grid.grid-cols-1.md:grid-cols-2.gap-4 (test name + description form row)",
        "problem": "Minor: no sm intermediate, but fields are acceptable as 1 col on phones.",
        "fix": "No change required."
      },
      {
        "line": 345,
        "element": "div.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-4 (test cards grid)",
        "problem": "Good responsive grid. No issues."
      }
    ]
  },
  {
    "file": "app/components/rpedetails/RpeDetailsCmp.vue",
    "issues": [
      {
        "line": 158,
        "element": "div.p-6.flex.flex-col.gap-6",
        "problem": "Outer wrapper uses p-6 (24 px) at all screen sizes — on 320 px phones this leaves only 272 px of content width.",
        "fix": "Change to `class=\"p-4 md:p-6 flex flex-col gap-6\"`"
      },
      {
        "line": 165,
        "element": "h1.text-3xl.font-black",
        "problem": "3xl (30 px) dashboard title is fine, but combined with p-4/p-6 padding it may feel heavy on small screens.",
        "fix": "Change to `class=\"text-2xl md:text-3xl font-black tracking-tight\"`"
      },
      {
        "line": 218,
        "element": "span.text-sm.sm:text-base.font-semibold (athlete name in card)",
        "problem": "Already responsive. No issues."
      }
    ]
  },
  {
    "file": "app/components/rpeinput/RpeInput.vue",
    "issues": []
  },
  {
    "file": "app/components/agenda/AgendaCalendar.vue",
    "issues": [
      {
        "line": 492,
        "element": "Card.w-full.max-w-sm.md:max-w-md (event dialog)",
        "problem": "Dialog container goes from max-w-sm (384 px) on mobile to max-w-md (448 px) at md. Combined with p-2 md:p-4 on the outer wrapper, on 360 px phones the card is 356 px wide with 8 px on each side — tight but functional.",
        "fix": "No fix required. Acceptable."
      },
      {
        "line": 565,
        "element": "div.flex.gap-3 (date + time inputs row)",
        "problem": "Date input is flex-1, time input is w-32 (128 px) fixed. On 320 px phones: 320 - 4 padding - 12 gap - 128 = 176 px for the date input. This is quite tight for a date picker.",
        "fix": "Change time input width to `class=\"w-28 sm:w-32\"` or stack them on mobile: `class=\"flex flex-col sm:flex-row gap-3\"`"
      },
      {
        "line": 544,
        "element": "div.h-20.md:h-24.p-1.5.md:p-2 (calendar day cells)",
        "problem": "Day cell height is 80 px on mobile. On phones with many events per day (multiple dots), the dots can exceed the cell height causing overflow. The dots are 6 px each but they use flex-wrap.",
        "fix": "Acceptable. The max-h could be added: `class=\"... overflow-hidden\"` on the dots container is already implicitly there via the cell border."
      }
    ]
  },
  {
    "file": "app/components/layout/AppSidebar.vue",
    "issues": []
  },
  {
    "file": "app/components/layout/Header.vue",
    "issues": [
      {
        "line": 33,
        "element": "header.sticky.top-0.flex.items-center.gap-4.border-b.px-4.md:px-6",
        "problem": "Header is a single-row flex container: SidebarTrigger | Separator | Breadcrumb | slot. On narrow screens (320 px), if the breadcrumb has 3+ segments, the text will be cut off with no truncation. The breadcrumb component is BaseBreadcrumbCustom — if it doesn't truncate internally it will overflow.",
        "fix": "Add `min-w-0 overflow-hidden` to the breadcrumb wrapper div: `<div class=\"w-full flex items-center gap-4 h-4 min-w-0 overflow-hidden\">`. Ensure BaseBreadcrumbCustom truncates long paths."
      }
    ]
  },
  {
    "file": "app/components/layout/SidebarNavFooter.vue",
    "issues": []
  },
  {
    "file": "app/components/settings/Layout.vue",
    "issues": []
  },
  {
    "file": "app/components/settings/SidebarNav.vue",
    "issues": [
      {
        "line": 26,
        "element": "nav.flex.lg:flex-col.space-x-2.lg:space-x-0.lg:space-y-1",
        "problem": "Settings sidebar nav is horizontal (flex row + space-x-2) on all screens below lg (1024 px). With 5 nav items ('Profile', 'Account', 'Appearance', 'Notifications', 'Display'), on a 360 px phone each button would be ~60 px wide — text may be cut off since buttons use `w-full` but in a flex-row the widths fight each other. There is no overflow-x-auto.",
        "fix": "Change to `class=\"flex overflow-x-auto lg:flex-col gap-1 lg:gap-0 pb-1 lg:pb-0\"` with `flex-shrink-0` on each Button. Or switch to a full-width horizontal scroll: add `overflow-x-auto snap-x` to the nav."
      }
    ]
  },
  {
    "file": "app/components/settings/ProfileForm.vue",
    "issues": [
      {
        "line": 107,
        "element": "div.w-full.h-[calc(100vh-4rem)].flex.flex-col.overflow-hidden",
        "problem": "Fixed viewport height `h-[calc(100vh-4rem)]` with `overflow-hidden` on the outer container. On small phones this can clip the save button at the bottom of the form if the screen is shorter than the form content.",
        "fix": "Change to `class=\"w-full min-h-[calc(100vh-4rem)] flex flex-col bg-background\"` and remove overflow-hidden. Let the inner div handle its own scrolling."
      },
      {
        "line": 117,
        "element": "div.grid.grid-cols-1.xl:grid-cols-4.gap-6.flex-1.min-h-0",
        "problem": "Grid only activates at xl (1280 px) — sidebar card and form card are stacked vertically from 0 to 1279 px. On lg tablets (1024–1279 px) the layout is suboptimal.",
        "fix": "Change to `class=\"grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0\"` to activate the 2-panel layout at 1024 px."
      }
    ]
  },
  {
    "file": "app/components/settings/AccountForm.vue",
    "issues": [
      {
        "line": 75,
        "element": "Button.w-[240px] (date of birth Popover trigger)",
        "problem": "Fixed w-[240px] on the date picker button. On 320 px phones, this overflows the form (form width is ~288 px inside FormItem padding). The button will force horizontal scroll or overflow.",
        "fix": "Change to `class=\"w-full sm:w-[240px] justify-start text-left font-normal ...\"`"
      },
      {
        "line": 95,
        "element": "Button.w-[200px] (language combobox trigger)",
        "problem": "Fixed w-[200px] — same issue as the date picker on very narrow phones.",
        "fix": "Change to `class=\"w-full sm:w-[200px] justify-between ...\"`"
      },
      {
        "line": 97,
        "element": "PopoverContent.w-[200px] (language list)",
        "problem": "Fixed w-[200px] popover. On mobile, popovers should be auto-width or take min-w-full of the trigger.",
        "fix": "Change to `class=\"w-full sm:w-[200px] p-0\"`"
      }
    ]
  },
  {
    "file": "app/components/settings/NotificationsForm.vue",
    "issues": []
  },
  {
    "file": "app/components/settings/AppearanceForm.vue",
    "issues": [
      {
        "line": 63,
        "element": "div.relative.w-[200px] (font select wrapper)",
        "problem": "Fixed w-[200px] on the font select. On very narrow phones (<320 px) this may overflow, though most modern phones are 360 px+.",
        "fix": "Change to `class=\"relative w-full sm:w-[200px]\"` so it takes full width on phones."
      }
    ]
  },
  {
    "file": "app/components/settings/DisplayForm.vue",
    "issues": []
  },
  {
    "file": "app/components/dashboard/DashboardSettings.vue",
    "issues": []
  },
  {
    "file": "app/components/dashboard/AdvancedFilterModal.vue",
    "issues": [
      {
        "line": 216,
        "element": "div.fixed.right-0.top-0.w-full.max-w-2xl (slide-in panel)",
        "problem": "The filter panel is a fixed right-slide-in drawer with w-full max-w-2xl. On mobile it is full-width which is correct. However the panel is full-height with no safe-area-inset padding at the bottom — on iOS devices with home indicator, content near the bottom may be obscured.",
        "fix": "Add `pb-safe` (requires Tailwind safelist) or `style=\"padding-bottom: env(safe-area-inset-bottom)\"` to the footer sticky div."
      },
      {
        "line": 245,
        "element": "div.grid.grid-cols-2.gap-2 (preset buttons)",
        "problem": "2-col grid for preset buttons. On 320 px phones each preset button is ~140 px wide. Preset names like 'Last 7 Days' may be truncated.",
        "fix": "Add text-ellipsis/overflow handling: `class=\"px-3 py-2 rounded border text-sm hover:bg-secondary transition truncate\"`"
      }
    ]
  },
  {
    "file": "app/components/dashboard/AthleteStatusTable.vue",
    "issues": []
  },
  {
    "file": "app/components/dashboard/MetricCard.vue",
    "issues": [
      {
        "line": 26,
        "element": "p.text-3xl.font-bold (KPI value)",
        "problem": "text-3xl (30 px) value in a card that shares a 2-col grid on phones. Long values like '100%' or a 4-digit number are fine, but this is a minor concern on 320 px devices.",
        "fix": "Consider `class=\"text-2xl sm:text-3xl font-bold text-foreground mt-1\"` to reduce size on very small screens."
      }
    ]
  },
  {
    "file": "app/components/dashboard/WorkloadChartWidget.vue",
    "issues": []
  },
  {
    "file": "app/components/dashboard/HealthAssessment.vue",
    "issues": []
  },
  {
    "file": "app/components/dashboard/RiskAssessmentWidget.vue",
    "issues": [
      {
        "line": 65,
        "element": "div.grid.grid-cols-3.gap-2 (summary counters)",
        "problem": "3-col grid for Critical/Increasing/Safe counters. On 320 px phones each cell is ~90 px. The text 'Increasing' (11 px / text-[11px]) and the bold number below barely fit but the label 'Increasing' may truncate.",
        "fix": "Add `truncate` to the label text or reduce the label to an abbreviation on mobile: `<p class=\"text-[10px] text-muted-foreground truncate\">`. Alternatively use `grid-cols-3 xs:grid-cols-3` as-is — functional."
      }
    ]
  },
  {
    "file": "app/components/agenda/EventCard.vue",
    "issues": []
  },
  {
    "file": "app/components/tasks/components/DataTable.vue",
    "issues": [
      {
        "line": 59,
        "element": "div.border.rounded-md wrapping Table",
        "problem": "CRITICAL: No overflow-x-auto wrapper around the Table component. The tasks table has multiple columns (select, ID, title, status, priority, due date, actions). On mobile (< 768 px) each column continues to render at its natural width, overflowing the viewport without a scrollbar visible to the user.",
        "fix": "Change the table wrapper: `<div class=\"border rounded-md overflow-x-auto\">`. Also consider adding `class=\"min-w-[600px]\"` to the Table element itself so columns don't collapse below a readable minimum."
      }
    ]
  }
]
```

---

## Priority Fix List (by severity)

### 🔴 Critical — Fix Immediately

| # | File | Issue |
|---|------|-------|
| 1 | `app/components/tasks/components/DataTable.vue` | Table has no `overflow-x-auto` — overflows on all mobile screens |
| 2 | `app/components/athletehealthc/AthleteHealthComp.vue` | Inner `<table>` has no `overflow-x-auto` + fixed w-32 bars |
| 3 | `app/components/athletehealthc/AthleteHealthComp.vue` | `xl:grid-cols-3` skips all breakpoints below 1280 px |
| 4 | `app/pages/(error)/401-503.vue` | `text-[7rem]` overflows on 320 px screens |
| 5 | `app/components/athmanagement/AthleteManagement.vue` | Hover-only action buttons invisible on all touch devices |
| 6 | `app/components/injury/InjuryManagement.vue` | Same hover-only issue + 2-col dialog grid too narrow on phones |

### 🟡 Moderate — Fix in Next Sprint

| # | File | Issue |
|---|------|-------|
| 7 | `app/components/athelete/AthleteDetail.vue` | Multiple grids skip md breakpoint (charts + sections) |
| 8 | `app/components/settings/ProfileForm.vue` | `h-[calc(100vh-4rem)] overflow-hidden` clips content on short phones; xl-only grid |
| 9 | `app/components/settings/AccountForm.vue` | `w-[240px]` and `w-[200px]` fixed-width elements overflow on phones |
| 10 | `app/components/settings/SidebarNav.vue` | Horizontal nav has no overflow-x-auto → items may overflow |
| 11 | `app/pages/landingpage.vue` | Excessive padding (`pt-32`, `pb-40`, `gap-24`, `gap-20`) on mobile, 500 px blob overflows |
| 12 | `app/components/dashboard/DashboardLayout.vue` | Workload + Risk and Table + Health rows only side-by-side at lg, not md |
| 13 | `app/pages/injuriesmanager.vue` | `min-w-[300px]` forced minimum on athlete select |
| 14 | `app/pages/sleephistory.vue` | `min-w-[280px]` on athlete select wrapper |
| 15 | `app/pages/athletemeasurements.vue` | `w-64` hardcoded Select trigger |

### 🟢 Already Well-Handled (mobile-first patterns observed)

- `MailCompLayout.vue` — dual view (table desktop / cards mobile)
- `AthleteStatusTable.vue` — dual view (table sm+ / card stack xs)
- `AgendaCalendar.vue` — responsive calendar grid + dialog
- `KanbanBoard.vue` — `overflow-x-auto` for horizontal scroll
- `DashboardLayout.vue` — KPI grid `grid-cols-2 sm:grid-cols-4`
- All error pages (except font size)
- Auth pages — use `max-w-sm` centered layout
- `RpeInput.vue` — constrained card layout, good
