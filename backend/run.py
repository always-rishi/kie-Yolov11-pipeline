
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    try:
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=port,
            reload=False
        )
    except OSError as exc:
        if "Address already in use" in str(exc) or "10048" in str(exc):
            alt_port = 8001
            print(f"⚠️ Port {port} is busy; retrying on {alt_port}")
            uvicorn.run(
                "app.main:app",
                host="127.0.0.1",
                port=alt_port,
                reload=False
            )
        else:
            raise
