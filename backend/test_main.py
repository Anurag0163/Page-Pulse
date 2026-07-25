from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_valid_url():
    response = client.get(
        "/analyze",
        params={"url": "https://example.com"}
    )

    assert response.status_code == 200

    data = response.json()

    assert "status_code" in data
    assert "response_time_ms" in data
    assert "title" in data
    assert "meta_description" in data
    assert "h1_count" in data
    assert "images_without_alt" in data
    assert "word_count" in data


def test_invalid_url():
    response = client.get(
        "/analyze",
        params={"url": "abcd"}
    )

    assert response.status_code == 400


def test_empty_url():
    response = client.get(
        "/analyze",
        params={"url": ""}
    )

    assert response.status_code == 400