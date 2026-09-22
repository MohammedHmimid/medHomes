"""Tests de bout en bout de l'API ImmoAssist.
Lancer avec :  pytest  (depuis le dossier backend/, apres installation de requirements-dev.txt)
"""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

TEST_USER = {
    "email": "test.user@immoassist.ma",
    "full_name": "Utilisateur Test",
    "password": "MotDePasse123",
}


def get_auth_headers():
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": TEST_USER["email"], "password": TEST_USER["password"]},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_check():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_register_user():
    resp = client.post("/api/v1/auth/register", json=TEST_USER)
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == TEST_USER["email"]
    assert "hashed_password" not in body


def test_register_duplicate_email_rejected():
    resp = client.post("/api/v1/auth/register", json=TEST_USER)
    assert resp.status_code == 400


def test_login_success_and_failure():
    ok = client.post(
        "/api/v1/auth/login",
        data={"username": TEST_USER["email"], "password": TEST_USER["password"]},
    )
    assert ok.status_code == 200
    assert "access_token" in ok.json()

    bad = client.post(
        "/api/v1/auth/login",
        data={"username": TEST_USER["email"], "password": "mauvais_mot_de_passe"},
    )
    assert bad.status_code == 401


def test_get_current_user_requires_token():
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401

    resp = client.get("/api/v1/auth/me", headers=get_auth_headers())
    assert resp.status_code == 200
    assert resp.json()["email"] == TEST_USER["email"]


def test_create_and_list_property():
    payload = {
        "title": "Appartement test avec vue",
        "description": "Un appartement de test avec une description suffisamment longue.",
        "property_type": "apartment",
        "transaction_type": "sale",
        "price": 750000,
        "surface_area": 75,
        "bedrooms": 2,
        "bathrooms": 1,
        "city": "Casablanca",
        "address": "12 rue de la Paix",
    }
    resp = client.post("/api/v1/properties", json=payload, headers=get_auth_headers())
    assert resp.status_code == 201
    created = resp.json()
    assert created["title"] == payload["title"]
    assert created["status"] == "available"

    listing = client.get("/api/v1/properties")
    assert listing.status_code == 200
    body = listing.json()
    assert body["total"] >= 1
    assert any(p["id"] == created["id"] for p in body["items"])

    detail = client.get(f"/api/v1/properties/{created['id']}")
    assert detail.status_code == 200
    assert detail.json()["owner"]["email"] == TEST_USER["email"]

    global TEST_PROPERTY_ID
    TEST_PROPERTY_ID = created["id"]


def test_property_filters():
    resp = client.get("/api/v1/properties", params={"city": "Casablanca", "transaction_type": "sale"})
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1

    resp = client.get("/api/v1/properties", params={"min_price": 999999999})
    assert resp.status_code == 200
    assert resp.json()["total"] == 0


def test_update_and_ownership_check():
    headers = get_auth_headers()
    props = client.get("/api/v1/properties/mine", headers=headers).json()
    prop_id = props[0]["id"]

    resp = client.put(f"/api/v1/properties/{prop_id}", json={"price": 800000}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["price"] == 800000

    resp = client.put(f"/api/v1/properties/{prop_id}", json={"price": 1})
    assert resp.status_code == 401  # pas de token = non authentifie


def test_favorites_flow():
    headers = get_auth_headers()
    props = client.get("/api/v1/properties/mine", headers=headers).json()
    prop_id = props[0]["id"]

    resp = client.post(f"/api/v1/favorites/{prop_id}", headers=headers)
    assert resp.status_code == 201

    favs = client.get("/api/v1/favorites", headers=headers)
    assert favs.status_code == 200
    assert any(f["property"]["id"] == prop_id for f in favs.json())

    resp = client.delete(f"/api/v1/favorites/{prop_id}", headers=headers)
    assert resp.status_code == 204


def test_contact_request_creates_notification_for_owner():
    headers = get_auth_headers()
    props = client.get("/api/v1/properties/mine", headers=headers).json()
    prop_id = props[0]["id"]

    resp = client.post("/api/v1/contacts", json={
        "property_id": prop_id,
        "name": "Visiteur Interesse",
        "email": "visiteur@example.com",
        "request_type": "property_inquiry",
        "message": "Bonjour, ce bien m'interesse beaucoup, est-il toujours disponible ?",
    })
    assert resp.status_code == 201

    notifs = client.get("/api/v1/notifications", headers=headers)
    assert notifs.status_code == 200
    assert len(notifs.json()) >= 1


def test_admin_stats_forbidden_for_regular_user():
    resp = client.get("/api/v1/stats/overview", headers=get_auth_headers())
    assert resp.status_code == 403


def test_delete_property():
    headers = get_auth_headers()
    props = client.get("/api/v1/properties/mine", headers=headers).json()
    prop_id = props[0]["id"]
    resp = client.delete(f"/api/v1/properties/{prop_id}", headers=headers)
    assert resp.status_code == 204
