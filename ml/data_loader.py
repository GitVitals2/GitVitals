"""
Data loader for ML training pipeline.
Connects to Supabase Postgres and loads training data from ml_training_data view.
"""
from __future__ import annotations

import os

import pandas as pd
import psycopg

def get_database_url() -> str:
    """
    Get database connection URL from environment.
    Priority: DATABASE_URL > SUPABASE_DB_URL
    """
    url = os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")
    if not url:
        raise ValueError(
            "Set the DATABASE_URL or SUPABASE_DB_URL environment variable "
            "to connect to Postgres."
        )
    return url


def load_training_data_from_db(
    limit: int | None = None,
    view_name: str = "ml_training_data",
) -> pd.DataFrame:
    """
    Load training data from Supabase Postgres.
    
    Args:
        limit: Optional row limit for testing (default: all rows)
        view_name: Name of the SQL view to query (default: ml_training_data)
    
    Returns:
        DataFrame with feature columns and at_risk target column
    
    Raises:
        ValueError: If DATABASE_URL is not set
        psycopg.Error: If database connection or query fails
    """
    db_url = get_database_url()

    query = f'SELECT * FROM "{view_name}"'
    if limit is not None and limit > 0:
        query += f" LIMIT {limit}"

    try:
        with psycopg.connect(db_url) as conn:
            df = pd.read_sql_query(query, conn)
    except Exception as e:
        raise RuntimeError(f"Database error when querying {view_name}: {e}") from e

    if df.empty:
        raise ValueError(
            f"No data returned from {view_name}. "
            "Ensure the view exists and contains labeled data "
            "(instructorLabel IS NOT NULL)."
        )

    # Validate required columns
    if "at_risk" not in df.columns:
        raise ValueError(f"Target column 'at_risk' not found in {view_name}")

    # Drop metadata columns (keep only features + target)
    metadata_cols = ["id", "studentId", "patientId", "readingNumber", "submittedAt", "gradedAt"]
    df = df.drop(columns=[c for c in metadata_cols if c in df.columns], errors="ignore")

    # Ensure numeric types
    for col in df.columns:
        if col != "at_risk":
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Drop rows with NaN in target
    df = df.dropna(subset=["at_risk"])

    print(f"Loaded {len(df)} training rows from {view_name}")
    print(f"  Features: {[c for c in df.columns if c != 'at_risk']}")
    print(f"  Target distribution: {df['at_risk'].value_counts().to_dict()}")

    return df
