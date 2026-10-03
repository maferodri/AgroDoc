from fastapi import FastAPI

app = FastAPI(title="detection service")


@app.get("/health")
def health():
    return {"service": "detection", "status": "ok"}
