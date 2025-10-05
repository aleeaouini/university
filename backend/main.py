import os
from fastapi import FastAPI
import database
from auth import router as auth_router  

database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()
app.include_router(auth_router)
SECRET_KEY = os.getenv("SECRET_KEY")
@app.get("/")
def root():
    return {"message": "API Running"}
