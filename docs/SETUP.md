# Setup and deployment

## Local demo

The default `APP_MODE=demo` needs no API keys, GPU, database, or model files. Use Python 3.11 or 3.12 for the documented environment and Node.js 22.12 or later.

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
cp .env.example .env
python -m app.backend.app
```

In another terminal:

```bash
cd app/frontend
npm ci
npm run dev
```

The browser uses http://localhost:5173 and the backend uses http://127.0.0.1:8000. Check `http://127.0.0.1:8000/api/health` for a JSON health response. The development server forwards `/api` requests to the backend. Restart the backend after changing `.env`.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_MODE` | `demo` | `demo` or `live`; no automatic fallback between them |
| `PORT` | `8000` | Port for the local Python entry point |
| `CORS_ORIGINS` | localhost and 127.0.0.1 on port 5173 | Comma-separated browser origins for a separate frontend |
| `LLM_PROVIDER` | `groq` | `groq` or `4o-mini` for research chat |
| `GROQ_API_KEY` | unset | Groq credential for research chat |
| `OPENAI_API_KEY` | unset | OpenAI credential for research chat |
| `T5_MODEL_PATH` | `app/backend/fine-tuned-t5-small-sql` | Local generator checkpoint |
| `TINYLLAMA_MODEL_PATH` | `app/backend/tinyllama-sql-explainer-full` | Local PEFT adapter directory |
| `VITE_API_BASE_URL` | empty | Frontend API origin; set in `app/frontend/.env` at build time when hosting separately |

Never put provider keys in a `VITE_` variable: frontend variables are public. `.env` files are excluded from Git. Relative checkpoint paths are resolved from the process working directory; absolute paths are recommended.

## Optional research models

Create a separate **Python 3.11 or 3.12** environment and install `requirements-models.txt`. It is a larger research environment and includes PyTorch. The original model versions are pinned separately from the demo dependencies.

Set `APP_MODE=live` in `.env`. Chat requires the selected provider key, downloads the `all-MiniLM-L6-v2` embedding model on first use, and uses the bundled OurSpace documents, index, and GraphML file. Provider requests can incur usage charges.

SQL generation requires the T5 checkpoint exported by the original training notebook. SQL explanations require the original TinyLlama PEFT adapter; the base TinyLlama model downloads on first use. Neither trained artifact is included in this repository. The loader expects an adapter directory with `adapter_config.json`, not a merged full-model directory. The current implementation uses CPU inference.

The API returns a configuration error when a required dependency, key, or checkpoint is unavailable. Health reports the configured mode and process readiness; it does not prove model availability. Original experiments remain under `R&D/`. Research mode has not been end-to-end validated during this refresh; notebook outputs are historical artifacts.

## Tests

```bash
python -m pytest
cd app/frontend
npm run build
npx playwright install chromium
npm test
```

The browser runner starts isolated servers on ports 18081 and 15173, leaving the normal development ports available. The tests cover the demo chat, relationship graph, downloads, SQL analysis, API errors, navigation, and a mobile viewport. An optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE` environment variable selects an existing Chromium installation.

To refresh the portfolio screenshots, run `CAPTURE_PORTFOLIO=1 npm test` from `app/frontend`. It writes the real browser captures to `docs/images/`. Use `REUSE_TEST_SERVERS=1` only when you have already started this application's test servers on the configured test ports.

## Deployment

```bash
docker compose up --build
```

Open http://localhost:8080. Nginx serves the compiled frontend, supports direct navigation to application routes, and proxies `/api` to Gunicorn. The backend runs as a non-root user. A named volume stores generated documents. The Compose configuration intentionally uses demo mode and does not require secrets.

If port 8080 is occupied, use `WEB_PORT=18080 docker compose up --build` and open http://localhost:18080. The published port binds to loopback by default.

This is a local portfolio demonstration, not a hardened multi-user service. Before exposing the API publicly, add authentication or request quotas, HTTPS, and an export-retention policy. Documents have unpredictable URLs but are not access-controlled, and currently remain on disk until removed by the operator. Do not submit private SQL to a publicly shared instance.

For a separate frontend host, set `VITE_API_BASE_URL` to the API origin before building and set the backend's `CORS_ORIGINS` to the frontend origin. Configure the frontend host to serve `index.html` for application routes. Static hosting alone does not run the Python API.

## Troubleshooting

- **API offline:** start the backend, check port 8000, and use the retry button in the interface.
- **Module import error:** run `python -m app.backend.app` from the repository root, not `python app.py` from the backend directory.
- **Unsupported demo question:** choose a bundled chat/generation example. SQL explainer accepts your own supported SELECT queries.
- **Schema validation error:** use MySQL `CREATE TABLE` definitions and include every table referenced by your query.
- **Unavailable model:** verify the optional dependencies and checkpoint paths. Demo mode never needs a checkpoint.
- **Large demo video:** the original MP4 uses Git LFS. The application does not need it; use `GIT_LFS_SKIP_SMUDGE=1 git clone ...` for a lighter checkout.
