from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL
import ssl

ssl_args = {"ssl": {"ssl_ca": "/etc/ssl/certs/ca-certificates.crt"}}

engine = create_engine(
    DATABASE_URL,
    connect_args=ssl_args
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()