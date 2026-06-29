# telda~ Workforce Dashboard — Admin Guide

## What Is This?

A single-file HTML dashboard that pulls live data from your Google Sheets via a Google Apps Script (GAS) web app. Open `index.html` in any browser — no server, no installation. All data stays in your Google account.

---

## Quick Start

1. Open `index.html` in Chrome or Edge.
2. Click **Setup Wizard** (top-right gear icon).
3. Paste your **GAS Web App URL** and hit **Save & Sync**.
4. Data loads automatically. Use the **Sync** button to refresh at any time.

---

## Screens

### Admin View
Full access to all tabs, reports, and configuration.

### Agent Portal
A read-only view agents log into with their **Agent ID**. They see only their own stats: QA scores, ART, CSAT, productivity, and coaching flags.

---

## Tabs (Admin)

### 1. Overview
The command centre. Shows a summary of all agents for the selected period.

**Filter bar**
- **Month dropdown** — pick any month from your data history.
- **From / To date pickers** — override the month with a custom range.
- **Filter Agents** — show only selected agents across all charts and cards.
- **⚙ View** — toggle individual sections on/off (persists across sessions).

**KPI Cards**
| Card | What it means |
|---|---|
| Agents | Total agents in the system |
| Tickets | QA-reviewed tickets in scope |
| Avg QA Score | Average quality score across all agents |
| Pass Rate | % of scores ≥ 90% |
| Disputed | QA tickets raised as disputes |
| Total Missing | Sum of missed productive minutes (if productivity tracking is on) |
| Total Chats | Raw chat inflows in scope |
| Avg AHT | Average Handle Time (green = at/below target, red = above) |
| Avg ART | Average Response Time (same color logic) |
| Avg CSAT | Average customer satisfaction score |

**Performance Spotlight** — top 3 and bottom 3 agents per KPI.

**Leaderboard** — composite score ranking. See *Leaderboard* section below.

**Charts** — QA by agent, QA outcome split (pass/near/fail), Productivity %, CSAT, AHT, and ART per agent.

**Disputed Tickets** — table of all disputed QA reviews with reason and ticket link.

**Agent Summary Table** — one row per agent: Team, Tickets, QA Score, AHT, ART, CSAT, Productivity, Missing time.

---

### 2. Quality
Full QA review table with coaching flags, score distribution, and trend chart.

- Set a **coaching threshold** (default 90%) — agents below it are flagged.
- Filter by agent, date range, or score band.
- Export to CSV.

---

### 3. Productivity
Tracks scheduled vs. actual productive time per agent.

- Shows missing minutes and overtime.
- Color-coded achievement percentage.
- Hidden from agent portal by default (toggle in Config Center).

---

### 4. Performance
Per-agent performance metrics from the Performance sheet: AHT, ART, CSAT, resolution rate, total conversations.

- Filter by agent and date range.
- Target thresholds are set in **Config Center**.

---

### 5. WoW (Week-over-Week)
Compares current week vs. previous week across all KPIs. Useful for spotting trends.

---

### 6. Root Cause
Categorises quality failures by coaching area. Helps identify systemic issues across the team.

---

### 7. Forecasting
Uses raw chat data (`agent_assigned_at` timestamp) to forecast future volume and staffing needs.

**Filter bar inputs**
| Input | What it does |
|---|---|
| History | How many weeks of past data to use for the forecast |
| Horizon | How many days ahead to forecast |
| Prod hrs/day | Productive hours per agent per day |
| Concurrency | How many chats one agent handles simultaneously |
| Headcount | Total agents available (system calculates daily available as total × 5/7 for 2 off-days/week) |
| Shifts | Number of shifts per day |
| Start hr | Hour the first shift starts (24h format) |
| Hourly view | Filter the hourly profile by day type |

**Forecast method:** Day-of-week weighted average (recent weeks weighted higher). Captures weekly seasonality without complex modelling.

**Staffing formula:**
```
Required agents = ceil(forecast volume × avg AHT in mins ÷ 60 ÷ prod hrs/day ÷ concurrency)
```

**Sections**
- Daily volume forecast with recommended headcount per day.
- Shift plan: splits the day into shifts and assigns recommended agents per shift.
- Calendar view: 7-day grid showing forecast volume and staffing.
- Hourly volume profile: shows peak hours across the day.

---

## Leaderboard

Ranks agents (or teams) by a weighted composite score built from 4 KPIs.

**Formula:**
```
Composite = (Quality × w%) + (CSAT × w%) + (AHT Score × w%) + (ART Score × w%)
```

**AHT and ART are inverted** — lower time = better score:
```
Score = min(100, target ÷ actual × 100)
```
Example: target AHT = 6 min, agent averages 8 min → score = 75%.

**Default weights:** 25% each. Change any weight in the leaderboard header and click **Apply**. Weights are saved in your browser and persist across sessions. If they don't sum to 100%, they are automatically normalised (a warning is shown).

**Team view:** Click **Teams** to switch from individual rankings to team-averaged scores. Click **Agents** to go back.

---

## Team Assignment

Assign agents to teams in **Setup → Teams**.

- Type a team name next to each agent's name.
- Use the autocomplete suggestions to keep names consistent.
- Click **Save Teams** — assignments sync to GAS and localStorage.
- Teams appear in the Overview Agent Summary table, the Leaderboard, and the Performance tab.

---

## Config Center

Access via **Setup Wizard → Config Center** (or the ⚙ Config button).

| Setting | Default | Notes |
|---|---|---|
| AHT Target | 6 min | Used for color-coding and leaderboard scoring |
| ART Target | 60 sec | Same |
| CSAT Target | 80% | Same |
| Resolution Target | 85% | — |
| Coaching Threshold | 90% | QA score below this flags agent for coaching |
| Required Available Hours | 7.8 h | Used for productivity calculation |
| Productivity Hidden | Off | Hides productivity tab and columns from agent portal |
| Break / Offline Statuses | — | AUX status categories for timeline classification |

---

## Data Sources (Google Sheets)

| Sheet | Key columns used |
|---|---|
| Quality | Agent Name, Timestamp, Score, Tickets Link |
| Performance | agent_name, work_date, avg_aht_min, avg_art_sec, csat_*, total_conversations |
| Timeline / AUX | agent_name, status, start_time, end_time |
| Raw (Support Desk) | agent_assigned_at, agent_name, agent_handle_time_min, first_response_time_sec, csat rating, ticket_status |
| Dispute Responses | ticket link, reason |

Agent names must match exactly across all sheets. Use the **Data Health** warning card in Overview to spot mismatches.

---

## GAS Deployment Tips

When you update the Apps Script code and want the dashboard to pick up changes:

1. In the Apps Script editor, press **Ctrl + S** to save.
2. Go to **Deploy → Manage deployments**.
3. Click the **pencil icon** on your existing deployment.
4. Set **Version** to **New version**.
5. Click **Deploy**.

If the URL changes, paste the new URL in **Setup Wizard → GAS URL**.

---

## Data Privacy

- All data is fetched from **your own** Google Sheets.
- The dashboard stores settings in **browser localStorage** only (no external database unless you connect Supabase).
- Agent passwords are **bcrypt-hashed** and never stored in plain text.
- No data leaves your browser except to call your own GAS endpoint.

---

## Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Sync data | — (click Sync button) |
| Switch tabs | Click nav items |
| Clear date range | Click **Clear** button in Overview |

---

## Glossary

| Term | Meaning |
|---|---|
| AHT | Average Handle Time — time spent actively on a chat (minutes) |
| ART | Average Response Time — time for first agent response (seconds) |
| CSAT | Customer Satisfaction — % of rated chats with positive rating |
| DSAT | Customer Dissatisfaction — negative rating |
| QA | Quality Assurance score from a reviewed interaction |
| Composite | Weighted average of Quality, CSAT, AHT score, and ART score |
| Concurrency | Number of chats one agent handles at the same time |
| Horizon | Number of future days included in the forecast |
| Prod hrs/day | Hours per day an agent spends on productive work |

---

*Dashboard built for telda~ Operations — Admin Guide v1.0*
