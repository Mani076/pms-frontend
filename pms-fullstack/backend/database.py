from sqlmodel import create_engine, Session
import oracledb
import os

DB_USER = "pms"
DB_PASSWORD = "pms_pass"

DB_HOST = "localhost"
DB_PORT = "1521"
DB_SERVICE = "xepdb1"  

DATABASE_URL = f"oracle+oracledb://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/?service_name={DB_SERVICE}"

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session