from fastapi import FastAPI

app = FastAPI(title="crops service")


@app.get("/health")
def health():
    return {"service": "crops", "status": "ok"}
