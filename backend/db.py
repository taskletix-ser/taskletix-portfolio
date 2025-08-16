
import os
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "taskletix_db"),
    "auth_plugin": "mysql_native_password",  # helps with some XAMPP setups
}

# Simple connection pool so we don't reconnect for each request
pool = pooling.MySQLConnectionPool(pool_name="taskletix_pool", pool_size=5, **DB_CONFIG)

def get_conn():
    return pool.get_connection()

