
# Analytics Platform — Frontend

Real-time analytics dashboard built with Next.js 14. Connects to the Analytics Platform backend API.

## Live Demo

- **Frontend:** https://analytics-platform.vercel.app
- **Backend API:** https://analytics-backend-h41f.onrender.com

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework + SSR |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| TanStack Query v5 | Server state + auto-refetch |
| Recharts | Charts and visualizations |
| Axios | HTTP client |
| Lucide React | Icons |

---

## Features

- **Login / Register** — Email/password + Google OAuth
- **Dashboard** — KPI cards, line chart, pie chart, auto-refresh every 5s
- **Events** — Live event stream table, send test events
- **Alerts** — Create threshold rules, view trigger history
- **Settings** — API key management, team invites (Admin+ only)
- **RBAC** — UI adapts based on role (Owner/Admin/Analyst/Viewer)
- **Invite flow** — Accept org invites via email link

---

## Project Structure

---

## Local Setup

### Prerequisites
- Node.js 18+
- Backend running (see backend README)

### Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production:
```env
NEXT_PUBLIC_API_URL=https://analytics-backend-h41f.onrender.com
```

---

## Authentication Flow

### Email/Password

---

## RBAC — What each role sees

| Feature | Viewer | Analyst | Admin | Owner |
|---|---|---|---|---|
| View dashboards | ✅ | ✅ | ✅ | ✅ |
| View events | ✅ | ✅ | ✅ | ✅ |
| View alerts | ✅ | ✅ | ✅ | ✅ |
| Send test events | ❌ | ✅ | ✅ | ✅ |
| Create dashboard | ❌ | ✅ | ✅ | ✅ |
| Create alert rule | ❌ | ✅ | ✅ | ✅ |
| Settings page | ❌ | ❌ | ✅ | ✅ |
| Manage API keys | ❌ | ❌ | ✅ | ✅ |
| Invite members | ❌ | ❌ | ✅ | ✅ |
| Invite as owner | ❌ | ❌ | ❌ | ✅ |

---

## API Integration

All requests go through `lib/api.ts`:

```typescript
// Reads org_id from localStorage on every request
api.interceptors.request.use((config) => {
  const orgId = localStorage.getItem("org_id");
  if (orgId) config.headers["X-Organization-ID"] = orgId;
  return config;
});

// Auto-refresh JWT on 401
api.interceptors.response.use(res => res, async (err) => {
  if (err.response?.status === 401 && !err.config._retry) {
    await api.post("/auth/token/refresh/");
    return api(err.config);
  }
});
```

---

## Key Components

### useRole hook
```typescript
const { role, canIngest, canManageTeam, canCreateDashboard } = useRole();

// Usage in components
{canIngest && <Button>Send Event</Button>}
{canManageTeam && <SettingsPage />}
```

### TanStack Query — auto-refresh
```typescript
// Events refetch every 5 seconds automatically
export const useEvents = () => useQuery({
  queryKey: ["events"],
  queryFn: async () => api.get("/ingestion/events/stream/"),
  refetchInterval: 5000,
});
```

---

## Deployment

### Vercel (automatic)

Every push to `main` triggers auto-deploy via Vercel GitHub integration.

### Manual deploy

```bash
vercel --prod
```

### Environment variables on Vercel

---

## Author

**Hemanth Dorepalli**
Full Stack Developer
hemanthd09166@gmail.com
