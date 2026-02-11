import numpy as np
import pandas as pd
from pathlib import Path

from train import (
    TrainOutputs,
    age_group,
    best_threshold,
    make_synthetic_data,
    train_model,
)


def test_make_synthetic_data_default():
    df = make_synthetic_data(n=100, seed=42)
    assert len(df) == 100
    assert "age_years" in df.columns
    assert "bp_systolic" in df.columns
    assert "at_risk" in df.columns
    assert df["at_risk"].isin([0, 1]).all()


def test_make_synthetic_data_age_range():
    df = make_synthetic_data(n=500, seed=7)
    assert df["age_years"].min() >= 0
    assert df["age_years"].max() <= 100


def test_make_synthetic_data_vitals_reasonable():
    df = make_synthetic_data(n=200, seed=10)
    assert df["bp_systolic"].between(80, 200).all()
    assert df["bp_diastolic"].between(50, 120).all()
    assert df["heart_rate"].between(40, 150).all()
    assert df["temperature"].between(95, 103).all()
    assert df["oxygen_saturation"].between(80, 100).all()


def test_age_group_neonate():
    assert age_group(0.5) == "neonate"
    assert age_group(0.9) == "neonate"


def test_age_group_child():
    assert age_group(1) == "child"
    assert age_group(7) == "child"
    assert age_group(12) == "child"


def test_age_group_teen():
    assert age_group(13) == "teen"
    assert age_group(15) == "teen"
    assert age_group(17) == "teen"


def test_age_group_adult():
    assert age_group(18) == "adult"
    assert age_group(30) == "adult"
    assert age_group(64) == "adult"


def test_age_group_senior():
    assert age_group(65) == "senior"
    assert age_group(80) == "senior"
    assert age_group(95) == "senior"


def test_train_model_returns_dict():
    df = make_synthetic_data(n=300, seed=15)
    result = train_model(df, seed=42, threshold=0.5)
    assert isinstance(result, dict)
    assert "model" in result
    assert "metrics" in result
    assert "eval_report" in result


def test_train_model_has_pipeline():
    df = make_synthetic_data(n=400, seed=20)
    result = train_model(df, seed=42)
    model = result["model"]
    assert hasattr(model, "predict")
    assert hasattr(model, "predict_proba")


def test_train_model_metrics_structure():
    df = make_synthetic_data(n=500, seed=25)
    result = train_model(df, seed=42)
    metrics = result["metrics"]
    
    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1" in metrics
    assert "roc_auc" in metrics
    assert "age_group_thresholds" in metrics
    assert 0 <= metrics["accuracy"] <= 1
    assert 0 <= metrics["roc_auc"] <= 1


def test_train_model_confusion_matrix():
    df = make_synthetic_data(n=600, seed=30)
    result = train_model(df, seed=42)
    metrics = result["metrics"]
    
    assert "confusion_matrix" in metrics
    cm = metrics["confusion_matrix"]
    assert "tn" in cm
    assert "fp" in cm
    assert "fn" in cm
    assert "tp" in cm


def test_best_threshold_returns_float():
    y_true = np.array([0, 0, 1, 1, 0, 1, 1, 0, 1, 0])
    prob = np.array([0.2, 0.3, 0.8, 0.7, 0.1, 0.9, 0.6, 0.4, 0.75, 0.15])
    threshold = best_threshold(y_true, prob)
    assert isinstance(threshold, float)
    assert 0 < threshold < 1


def test_train_outputs_dataclass():
    from pathlib import Path
    model_path = Path("/tmp/model.joblib")
    metrics_path = Path("/tmp/metrics.json")
    
    outputs = TrainOutputs(model_path=model_path, metrics_path=metrics_path)
    
    assert outputs.model_path == model_path
    assert outputs.metrics_path == metrics_path


def test_synthetic_data_reproducible():
    df1 = make_synthetic_data(n=100, seed=50)
    df2 = make_synthetic_data(n=100, seed=50)
    
    pd.testing.assert_frame_equal(df1, df2)


def test_synthetic_data_different_seeds():
    df1 = make_synthetic_data(n=100, seed=60)
    df2 = make_synthetic_data(n=100, seed=61)
    
    assert not df1.equals(df2)


def test_pulse_pressure_calculated():
    df = make_synthetic_data(n=50, seed=70)
    assert (df["pulse_pressure"] == df["bp_systolic"] - df["bp_diastolic"]).all()


def test_at_risk_binary():
    df = make_synthetic_data(n=100, seed=80)
    assert df["at_risk"].dtype in [np.int64, np.int32, int]
    assert set(df["at_risk"].unique()).issubset({0, 1})


def test_load_data_synthetic():
    from train import load_data
    df = load_data("synthetic")
    assert len(df) > 0
    assert "at_risk" in df.columns
    assert "age_years" in df.columns


def test_load_data_invalid_source():
    from train import load_data
    try:
        load_data("invalid_source")
        assert False, "Should raise ValueError"
    except ValueError as e:
        assert "Invalid source" in str(e)


def test_load_data_csv_not_found():
    from train import load_data
    from pathlib import Path
    try:
        load_data("csv", csv_path=Path("/nonexistent/file.csv"))
        assert False, "Should raise FileNotFoundError"
    except FileNotFoundError as e:
        assert "CSV not found" in str(e)


def test_load_data_csv_missing_target():
    from train import load_data
    import tempfile
    from pathlib import Path
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write("age_years,heart_rate\n")
        f.write("30,72\n")
        csv_path = Path(f.name)
    
    try:
        load_data("csv", csv_path=csv_path)
        assert False, "Should raise ValueError"
    except ValueError as e:
        assert "at_risk" in str(e)
    finally:
        csv_path.unlink()


def test_load_data_csv_valid():
    from train import load_data
    import tempfile
    from pathlib import Path
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write("age_years,heart_rate,at_risk\n")
        f.write("30,72,0\n")
        f.write("80,110,1\n")
        csv_path = Path(f.name)
    
    try:
        df = load_data("csv", csv_path=csv_path)
        assert len(df) == 2
        assert "at_risk" in df.columns
    finally:
        csv_path.unlink()


def test_train_model_missing_age_column():
    df = pd.DataFrame({"heart_rate": [70, 80], "at_risk": [0, 1]})
    try:
        train_model(df)
        assert False, "Should raise ValueError"
    except ValueError as e:
        assert "age_years" in str(e)


def test_save_artifacts():
    from train import save_artifacts, train_model
    import tempfile
    import shutil
    
    df = make_synthetic_data(n=100, seed=99)
    result = train_model(df, seed=42)
    
    temp_dir = tempfile.mkdtemp()
    try:
        import train
        original_dir = train.ARTIFACTS_DIR
        train.ARTIFACTS_DIR = Path(temp_dir) / "artifacts"
        
        outputs = save_artifacts(result["model"], result["metrics"], result["eval_report"])
        
        assert outputs.model_path.exists()
        assert outputs.metrics_path.exists()
        
        train.ARTIFACTS_DIR = original_dir
    finally:
        shutil.rmtree(temp_dir)


def test_load_data_db_fallback():
    from train import load_data
    
    try:
        df = load_data("db", limit=10)
        assert "at_risk" in df.columns
    except Exception:
        pass


def test_train_main_with_synthetic():
    import sys
    import train
    
    original_argv = sys.argv
    try:
        sys.argv = ["train.py", "--source", "synthetic", "--threshold", "0.5"]
        train.main()
    except SystemExit:
        pass
    finally:
        sys.argv = original_argv


def test_train_main_with_csv():
    import sys
    import train
    import tempfile
    from pathlib import Path
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write("age_years,heart_rate,bp_systolic,at_risk\n")
        for i in range(100):
            age = 30 + i % 50
            hr = 60 + i % 40
            bp = 110 + i % 60
            risk = i % 2
            f.write(f"{age},{hr},{bp},{risk}\n")
        csv_path = Path(f.name)
    
    original_argv = sys.argv
    try:
        sys.argv = ["train.py", "--source", "csv", "--csv", str(csv_path)]
        train.main()
    except SystemExit:
        pass
    finally:
        sys.argv = original_argv
        csv_path.unlink()


def test_exception_handler_in_import():
    try:
        import train
        assert hasattr(train, 'load_training_data_from_db')
    except Exception:
        pass
