from fastapi import FastAPI

app = FastAPI(title="consultations service")


@app.get("/health")
def health():
    return {"service": "consultations", "status": "ok"}
