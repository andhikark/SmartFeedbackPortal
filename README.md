# Smart Feedback Portal

A production-ready customer feedback portal with real-time AI-powered classification and prioritization using **Next.js 14**, **Supabase**, and **n8n**.

---

## Prerequisites

Before starting, make sure you have:

* **Node.js**: v18 or later
* **npm** or **yarn**
* A **Supabase** account (free tier is sufficient)
* An **n8n** instance (n8n Cloud recommended)
* Git (optional, but recommended)

You can verify Node.js with:

```bash
node -v
```

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd feedback-portal
npm install
```

---

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

These values can be found in:
**Supabase Dashboard → Project Settings → API**

> ⚠️ Never expose your `SERVICE_ROLE_KEY` to the frontend.

---

### 3. Supabase Database Setup

Create the `feedback` table and enable Row Level Security (RLS).

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
```

---

## Row Level Security (RLS) Policies

Below are the **RLS policies** used in this project. These ensure:

* Users can only read and insert **their own feedback**
* n8n (using service role key) can update any row

### Read Own Feedback

```sql
CREATE POLICY "Users can read own feedback"
ON feedback
FOR SELECT
USING (auth.uid() = user_id);
```

### Insert Own Feedback

```sql
CREATE POLICY "Users can insert own feedback"
ON feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Allow n8n Updates (Service Role)

```sql
CREATE POLICY "Service role can update feedback"
ON feedback
FOR UPDATE
USING (true);
```

### Realtime Support

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE feedback;
```


---

## n8n Setup (Automation)

1. Create a workflow in **n8n**
2. Add nodes in this order:

   * **Webhook (POST)** – receives Supabase INSERT events
   * **Function** – classifies feedback (Bug / Feature / General)
   * **HTTP Request** – updates Supabase record
   * **Respond to Webhook**

### Required n8n Variables

In **n8n → Variables**, add:

| Key                    | Scope  | Description               |
| ---------------------- | ------ | ------------------------- |
| `SUPABASE_URL`         | Global | Supabase project URL      |
| `SUPABASE_SERVICE_KEY` | Global | Supabase service role key |

These are accessed in workflows using:

```js
{{ $vars.SUPABASE_URL }}
{{ $vars.SUPABASE_SERVICE_KEY }}
```

---

### Supabase Database Webhook

Create a database webhook:

* **Table**: `feedback`
* **Event**: `INSERT`
* **Type**: HTTP Request
* **URL**: n8n production webhook URL

Example:

```text
https://<your-n8n>.app.n8n.cloud/webhook/feedback-webhook
```

---

## Running the App

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## How It Works (High Level)

1. User submits feedback
2. Feedback is stored in Supabase (`Pending`)
3. Supabase triggers n8n webhook
4. n8n classifies feedback
5. Supabase row is updated (`Processed`)
6. UI updates instantly via Realtime

---

## Tech Stack

* **Frontend**: Next.js 14, React, TypeScript
* **Backend**: Supabase (Postgres, Auth, Realtime)
* **Automation**: n8n
* **Styling**: Tailwind CSS + shadcn/ui

---

## Notes for Reviewers

* RLS ensures strict data isolation
* Service role key is only used inside n8n
* No polling — all updates are real-time


## Brief video 
https://youtu.be/6hi_8oNswEg
