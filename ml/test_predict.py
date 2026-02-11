import json
import tempfile
from pathlib import Path

import pytest
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from predict import (
    _age_group,
    _coerce_payload,
    _resolve_threshold,
    get_feature_names,
    load_metrics,
    predict_from_json,
)


def temp_metrics_file():
    tmpdir = tempfile.mkdtemp()
    metrics_path = Path(tmpdir) / "metrics.json"
    metrics_data = {
        "accuracy": 0.85,
        "threshold": 0.5,
        "feature_names": ["bp_systolic", "heart_rate", "temperature"],
        "age_group_thresholds": {
            "neonate": 0.4,
            "child": 0.45,
            "teen": 0.48,
            "adult": 0.5,
            "senior": 0.55
        }
    }
    metrics_path.write_text(json.dumps(metrics_data))
    return metrics_path


def simple_model():
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression())
    ])
    return model


def test_age_group_neonate():
    assert _age_group(0.5) == "neonate"
    assert _age_group(0.99) == "neonate"


def test_age_group_child():
    assert _age_group(1.0) == "child"
    assert _age_group(8) == "child"
    assert _age_group(12.9) == "child"


def test_age_group_teen():
    assert _age_group(13) == "teen"
    assert _age_group(16) == "teen"
    assert _age_group(17.5) == "teen"


def test_age_group_adult():
    assert _age_group(18) == "adult"
    assert _age_group(40) == "adult"
    assert _age_group(64.9) == "adult"


def test_age_group_senior():
    assert _age_group(65) == "senior"
    assert _age_group(75) == "senior"
    assert _age_group(90) == "senior"


def test_load_metrics_valid():
    metrics_file = temp_metrics_file()
    import predict
    original_path = predict.METRICS_PATH
    predict.METRICS_PATH = metrics_file
    
    metrics = load_metrics()
    
    assert isinstance(metrics, dict)
    assert "accuracy" in metrics
    assert "threshold" in metrics
    assert metrics["accuracy"] == 0.85
    
    predict.METRICS_PATH = original_path


def test_load_metrics_missing_file():
    import predict
    original_path = predict.METRICS_PATH
    predict.METRICS_PATH = Path("/nonexistent/path/metrics.json")
    
    try:
        load_metrics()
        assert False, "Should have raised FileNotFoundError"
    except FileNotFoundError:
        pass
    
    predict.METRICS_PATH = original_path


def test_get_feature_names_from_model_attribute():
    class MockModel:
        feature_names_in_ = ["bp_systolic", "heart_rate", "temperature"]
    
    model = MockModel()
    metrics = {}
    
    names = get_feature_names(model, metrics)
    
    assert names == ["bp_systolic", "heart_rate", "temperature"]


def test_get_feature_names_from_metrics():
    class MockModel:
        pass
    
    model = MockModel()
    metrics = {"feature_names": ["bp_systolic", "heart_rate", "oxygen_saturation"]}
    
    names = get_feature_names(model, metrics)
    
    assert names == ["bp_systolic", "heart_rate", "oxygen_saturation"]


def test_get_feature_names_missing_both():
    class MockModel:
        pass
    
    model = MockModel()
    metrics = {}
    
    try:
        get_feature_names(model, metrics)
        assert False, "Should have raised RuntimeError"
    except RuntimeError:
        pass


def test_coerce_payload_adds_pulse_pressure():
    payload = {
        "bp_systolic": 120,
        "bp_diastolic": 80,
        "heart_rate": 70
    }
    feature_names = ["bp_systolic", "bp_diastolic", "heart_rate", "pulse_pressure"]
    
    result = _coerce_payload(payload, feature_names)
    
    assert "pulse_pressure" in result
    assert result["pulse_pressure"] == 40


def test_coerce_payload_keeps_existing_pulse_pressure():
    payload = {
        "bp_systolic": 120,
        "bp_diastolic": 80,
        "pulse_pressure": 35
    }
    feature_names = ["bp_systolic", "bp_diastolic", "pulse_pressure"]
    
    result = _coerce_payload(payload, feature_names)
    
    assert result["pulse_pressure"] == 35


def test_coerce_payload_no_bp_values():
    payload = {"heart_rate": 70, "temperature": 98.6}
    feature_names = ["heart_rate", "temperature", "pulse_pressure"]
    
    result = _coerce_payload(payload, feature_names)
    
    assert "pulse_pressure" not in result


def test_resolve_threshold_default():
    metrics = {"threshold": 0.5}
    payload = {"heart_rate": 70}
    
    threshold = _resolve_threshold(metrics, payload, 0.6)
    
    assert threshold == 0.6


def test_resolve_threshold_age_specific():
    metrics = {
        "age_group_thresholds": {
            "neonate": 0.4,
            "child": 0.45,
            "teen": 0.48,
            "adult": 0.5,
            "senior": 0.55
        }
    }
    
    payload_child = {"age_years": 8}
    assert _resolve_threshold(metrics, payload_child, 0.5) == 0.45
    
    payload_senior = {"age_years": 70}
    assert _resolve_threshold(metrics, payload_senior, 0.5) == 0.55
    
    payload_adult = {"age_years": 30}
    assert _resolve_threshold(metrics, payload_adult, 0.5) == 0.5


def test_resolve_threshold_missing_age():
    metrics = {
        "age_group_thresholds": {
            "adult": 0.5
        }
    }
    payload = {"heart_rate": 70}
    
    threshold = _resolve_threshold(metrics, payload, 0.6)
    
    assert threshold == 0.6


def test_predict_from_json_missing_features():
    model = simple_model()
    feature_names = ["bp_systolic", "heart_rate", "temperature"]
    payload = {"bp_systolic": 120, "heart_rate": 70}
    
    with pytest.raises(ValueError) as exc_info:
        predict_from_json(model, payload, feature_names, 0.5)
    
    error_msg = str(exc_info.value).lower()
    assert "missing" in error_msg


def test_coerce_payload_preserves_data():
    payload = {
        "bp_systolic": 120,
        "heart_rate": 75,
        "temperature": 98.6,
        "oxygen_saturation": 97
    }
    feature_names = ["bp_systolic", "heart_rate", "temperature"]
    
    result = _coerce_payload(payload, feature_names)
    
    assert result["bp_systolic"] == 120
    assert result["heart_rate"] == 75
    assert result["temperature"] == 98.6
    assert result["oxygen_saturation"] == 97


def test_age_group_boundary_values():
    assert _age_group(0.0) == "neonate"
    assert _age_group(1.0) == "child"
    assert _age_group(13.0) == "teen"
    assert _age_group(18.0) == "adult"
    assert _age_group(65.0) == "senior"


def test_load_metrics_not_dict():
    import tempfile
    from pathlib import Path
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        f.write('["not", "a", "dict"]')
        metrics_path = Path(f.name)
    
    try:
        import predict
        original_path = predict.METRICS_PATH
        predict.METRICS_PATH = metrics_path
        
        try:
            load_metrics()
            assert False, "Should raise ValueError"
        except ValueError as e:
            assert "not a JSON object" in str(e)
        
        predict.METRICS_PATH = original_path
    finally:
        metrics_path.unlink()


def test_coerce_payload_missing_bp():
    payload = {"heart_rate": 70}
    feature_names = ["heart_rate", "pulse_pressure"]
    
    result = _coerce_payload(payload, feature_names)
    
    assert "pulse_pressure" not in result
    assert result["heart_rate"] == 70


def test_coerce_payload_invalid_bp_type():
    payload = {"bp_systolic": "invalid", "bp_diastolic": 80, "heart_rate": 70}
    feature_names = ["heart_rate", "pulse_pressure"]
    
    result = _coerce_payload(payload, feature_names)
    
    assert "pulse_pressure" not in result


def test_resolve_threshold_no_thresholds_dict():
    metrics = {"threshold": 0.5}
    payload = {"age_years": 30}
    
    threshold = _resolve_threshold(metrics, payload, 0.6)
    
    assert threshold == 0.6


def test_resolve_threshold_invalid_age():
    metrics = {
        "age_group_thresholds": {
            "adult": 0.5
        }
    }
    payload = {"age_years": "invalid"}
    
    threshold = _resolve_threshold(metrics, payload, 0.6)
    
    assert threshold == 0.6


def test_resolve_threshold_missing_group():
    metrics = {
        "age_group_thresholds": {
            "child": 0.45
        }
    }
    payload = {"age_years": 70}
    
    threshold = _resolve_threshold(metrics, payload, 0.6)
    
    assert threshold == 0.6


def test_predict_from_json_extra_features():
    import numpy as np
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler
    
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression())
    ])
    
    X_train = np.array([[120, 72], [130, 80], [110, 68]])
    y_train = np.array([0, 1, 0])
    model.fit(X_train, y_train)
    
    feature_names = ["bp_systolic", "heart_rate"]
    payload = {
        "bp_systolic": 120,
        "heart_rate": 72,
        "extra_field": 999
    }
    
    result = predict_from_json(model, payload, feature_names, 0.5)
    
    assert "pred" in result
    assert "risk_probability" in result


def test_predict_from_json_non_numeric():
    import numpy as np
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler
    
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression())
    ])
    
    X_train = np.array([[120, 72], [130, 80], [110, 68]])
    y_train = np.array([0, 1, 0])
    model.fit(X_train, y_train)
    
    feature_names = ["bp_systolic", "heart_rate"]
    payload = {
        "bp_systolic": "not_a_number",
        "heart_rate": 72
    }
    
    try:
        predict_from_json(model, payload, feature_names, 0.5)
        assert False, "Should raise ValueError"
    except ValueError as e:
        assert "Non-numeric" in str(e)


def test_predict_from_json_with_metrics():
    import numpy as np
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler
    
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression())
    ])
    
    X_train = np.array([[120, 72, 30], [160, 110, 75], [110, 68, 25]])
    y_train = np.array([0, 1, 0])
    model.fit(X_train, y_train)
    
    feature_names = ["bp_systolic", "heart_rate", "age_years"]
    payload = {
        "bp_systolic": 120,
        "heart_rate": 72,
        "age_years": 70
    }
    
    metrics = {
        "threshold": 0.5,
        "age_group_thresholds": {
            "senior": 0.55
        }
    }
    
    result = predict_from_json(model, payload, feature_names, 0.5, metrics)
    
    assert "pred" in result
    assert "risk_probability" in result
    assert result["threshold"] == 0.55


def test_predict_main_without_json():
    import sys
    import predict
    from io import StringIO
    
    original_argv = sys.argv
    original_stdout = sys.stdout
    
    try:
        sys.argv = ["predict.py"]
        sys.stdout = StringIO()
        predict.main()
        output = sys.stdout.getvalue()
        assert "Expected feature names" in output or "No --json" in output
    except SystemExit:
        pass
    finally:
        sys.argv = original_argv
        sys.stdout = original_stdout


def test_predict_main_with_json():
    import sys
    import predict
    import json
    from io import StringIO
    
    original_argv = sys.argv
    original_stdout = sys.stdout
    
    payload = {
        "age_years": 30,
        "bp_systolic": 120,
        "bp_diastolic": 80,
        "heart_rate": 72,
        "temperature": 98.6,
        "respiratory_rate": 16,
        "oxygen_saturation": 98,
        "pulse_pressure": 40,
        "pain_level": 2
    }
    
    try:
        sys.argv = ["predict.py", "--json", json.dumps(payload)]
        sys.stdout = StringIO()
        predict.main()
    except SystemExit:
        pass
    finally:
        sys.argv = original_argv
        sys.stdout = original_stdout


def test_predict_main_invalid_json():
    import sys
    import predict
    from io import StringIO
    
    original_argv = sys.argv
    original_stderr = sys.stderr
    
    try:
        sys.argv = ["predict.py", "--json", "not valid json"]
        sys.stderr = StringIO()
        predict.main()
    except SystemExit as e:
        assert e.code == 2
    finally:
        sys.argv = original_argv
        sys.stderr = original_stderr


def test_predict_main_json_not_dict():
    import sys
    import predict
    from io import StringIO
    
    original_argv = sys.argv
    original_stderr = sys.stderr
    
    try:
        sys.argv = ["predict.py", "--json", '["not", "a", "dict"]']
        sys.stderr = StringIO()
        predict.main()
    except SystemExit as e:
        assert e.code == 2
    finally:
        sys.argv = original_argv
        sys.stderr = original_stderr


def test_predict_main_model_not_found():
    import sys
    import predict
    from pathlib import Path
    
    original_argv = sys.argv
    original_model_path = predict.MODEL_PATH
    
    try:
        predict.MODEL_PATH = Path("/nonexistent/model.joblib")
        sys.argv = ["predict.py", "--model", "/nonexistent/model.joblib"]
        predict.main()
        assert False, "Should raise FileNotFoundError"
    except FileNotFoundError:
        pass
    except SystemExit:
        pass
    finally:
        sys.argv = original_argv
        predict.MODEL_PATH = original_model_path
