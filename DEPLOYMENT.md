# DigiWallet — Deployment Guide

## Architecture

```
GitHub Repo
    │
    ├── Push to main
    │       │
    │       ├──► Railway (Spring Boot backend)  ◄──► TiDB Cloud (MySQL)
    │       │
    │       └──► Vercel (React frontend)
```

- **Frontend** → Vercel (static Vite build)
- **Backend** → Railway (Spring Boot JAR, Java 21)
- **Database** → TiDB Cloud (MySQL-compatible, free Serverless tier)

---

## Step 1 — Push to GitHub

```bash
cd digiwallet          # the inner digiwallet folder (has pom.xml)
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/digiwallet.git
git push -u origin main
```

---

## Step 2 — Set up TiDB Cloud

1. Go to https://tidbcloud.com and sign up (free)
2. Create a **Serverless** cluster (free tier, no credit card)
3. Once the cluster is ready, click **Connect**
4. Choose **General** → **JDBC** connection type
5. Copy the connection string — it looks like:
   ```
   jdbc:mysql://<host>:4000/<database>?user=<user>&password=<password>&sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3
   ```
6. Note down separately:
   - **Host**: `gateway01.us-east-1.prod.aws.tidbcloud.com`
   - **Port**: `4000`
   - **Database**: your database name
   - **Username**: your username
   - **Password**: your password

> TiDB Cloud requires SSL. The JDBC URL must include `sslMode=VERIFY_IDENTITY`.

---

## Step 3 — Deploy Backend on Railway

1. Go to https://railway.app and sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `digiwallet` repo
4. Railway will detect the `railway.toml` and build automatically

### Set Environment Variables in Railway

Go to your service → **Variables** tab and add:

| Variable | Value |
|---|---|
| `TIDB_URL` | `jdbc:mysql://<host>:4000/<db>?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3` |
| `TIDB_USER` | your TiDB username |
| `TIDB_PASSWORD` | your TiDB password |
| `TIDB_DRIVER` | `com.mysql.cj.jdbc.Driver` |
| `JPA_DIALECT` | `org.hibernate.dialect.MySQLDialect` |
| `DDL_AUTO` | `update` |
| `H2_CONSOLE_ENABLED` | `false` |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` (fill in after Vercel deploy) |
| `DB_POOL_SIZE` | `3` |

5. Railway will redeploy automatically after saving variables
6. Go to **Settings** → **Networking** → **Generate Domain**
7. Copy your Railway URL: `https://digiwallet-production-xxxx.up.railway.app`
8. Test it: `https://your-railway-url.up.railway.app/api/status`

---

## Step 4 — Deploy Frontend on Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click **Add New Project** → Import your `digiwallet` repo
3. Configure the project:
   - **Root Directory**: `digiwallet/frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variable:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-railway-url.up.railway.app` |

5. Click **Deploy**
6. Copy your Vercel URL: `https://digiwallet-xxx.vercel.app`

---

## Step 5 — Update CORS on Railway

Go back to Railway → Variables and update:

```
CORS_ALLOWED_ORIGINS = https://digiwallet-xxx.vercel.app
```

Railway will redeploy. Your app is now fully live.

---

## Step 6 — Add GitHub Secret for CI

In your GitHub repo → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Value |
|---|---|
| `VITE_API_URL` | `https://your-railway-url.up.railway.app` |

This lets the CI pipeline build the frontend with the correct API URL.

---

## Local Development (unchanged)

```bash
# Terminal 1 — Backend
cd digiwallet
./mvnw spring-boot:run

# Terminal 2 — Frontend
cd digiwallet/frontend
npm run dev
```

The Vite dev proxy forwards `/api` → `http://localhost:8081` automatically.

---

## Environment Variable Reference

### Backend (Railway)

| Variable | Description | Default (local) |
|---|---|---|
| `PORT` | Server port | `8081` |
| `TIDB_URL` | Full JDBC connection URL | H2 in-memory |
| `TIDB_USER` | Database username | `sa` |
| `TIDB_PASSWORD` | Database password | `password` |
| `TIDB_DRIVER` | JDBC driver class | `org.h2.Driver` |
| `JPA_DIALECT` | Hibernate dialect | `H2Dialect` |
| `DDL_AUTO` | Schema strategy (`update`/`create-drop`) | `update` |
| `H2_CONSOLE_ENABLED` | Enable H2 web console | `true` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |
| `DB_POOL_SIZE` | HikariCP max pool size | `5` |

### Frontend (Vercel)

| Variable | Description | Default (local) |
|---|---|---|
| `VITE_API_URL` | Backend base URL (no trailing slash) | `` (empty — uses Vite proxy) |

---

## Troubleshooting

**CORS errors in browser**
- Make sure `CORS_ALLOWED_ORIGINS` on Railway exactly matches your Vercel URL (no trailing slash)
- Redeploy Railway after changing the variable

**TiDB SSL error**
- Ensure the JDBC URL includes `sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3`
- TiDB Cloud Serverless always requires SSL

**Railway build fails**
- Check that `mvnw` is executable: `git update-index --chmod=+x digiwallet/mvnw`
- Push the change: `git add digiwallet/mvnw && git commit -m "fix mvnw permissions" && git push`

**Vercel shows blank page**
- Check that `VITE_API_URL` is set correctly in Vercel environment variables
- Redeploy after adding the variable (Vercel doesn't auto-redeploy on env var changes)

**"Wallet not found" after redeployment**
- With `DDL_AUTO=update`, the schema persists in TiDB — data is safe across redeploys
- Only `create-drop` would wipe data (used locally)
