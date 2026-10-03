from fastapi import FastAPI

app = FastAPI(title="diagnosis service")


@app.get("/health")
def health():
    return {"service": "diagnosis", "status": "ok"}
