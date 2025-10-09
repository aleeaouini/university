import os
from fastapi import FastAPI
import database
from auth import router as auth_router  
from fastapi.middleware.cors import CORSMiddleware


database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
SECRET_KEY = os.getenv("SECRET_KEY")
@app.get("/")
def root():
    return {"message": "API Running"}
