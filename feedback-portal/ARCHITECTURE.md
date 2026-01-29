# Architecture Documentation

## System Overview

The Smart Feedback Portal is a full-stack application that demonstrates modern web development practices with automated workflows and real-time updates.

```
┌─────────────┐
│   Browser   │
│  (Next.js)  │
└──────┬──────┘
       │
       │ REST API / Realtime
       │
┌──────▼───────────────────────┐
│        Supabase              │
│  ┌───────────────────────┐   │
│  │   PostgreSQL          │   │
│  │   - feedback table    │   │
│  │   - auth.users        │   │
│  └───────────────────────┘   │
│                              │
│  ┌───────────────────────┐   │
│  │   Authentication      │   │
│  │   - Email/Password    │   │
│  └───────────────────────┘   │
│                              │
│  ┌───────────────────────┐   │
│  │   Realtime            │   │
│  │   - WebSocket         │   │
│  └───────────────────────┘   │
│                              │
│  ┌───────────────────────┐   │
│  │   Database Webhooks   │   │
│  │   - INSERT trigger    │   │
│  └──────────┬────────────┘   │
└─────────────┼────────────────┘
              │
              │ HTTP POST
              │
       ┌──────▼──────┐
       │    n8n      │
       │  Workflow   │
       │             │
       │ 1. Receive  │
       │ 2. Classify │
       │ 3. Update   │
       └─────────────┘
```

## Frontend Architecture

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks + Supabase Realtime
- **API Client**: Supabase JavaScript Client

### Directory Structure

```
feedback-portal/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login page (route group)
│   ├── dashboard/          # Protected dashboard
│   ├── layout.tsx          # Root layout with Toaster
│   ├── page.tsx            # Home redirect
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Reusable UI components (shadcn)
│   ├── feedback-form.tsx   # Feedback submission form
│   ├── feedback-list.tsx   # Real-time feedback list
│   └── auth-button.tsx     # Authentication controls
└── lib/
    ├── supabase/
    │   ├── client.ts       # Client-side Supabase
    │   └── server.ts       # Server-side Supabase
    ├── types.ts            # TypeScript definitions
    └── utils.ts            # Utility functions
```