"""Comprehensive test suite for AlphaVoice Studio website, customer panel, and admin API."""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def client():
    from core.db import init_db
    init_db()
    from api.routers.website import _ensure_default_admin
    _ensure_default_admin()
    from main import app
    return TestClient(app)


def test_website_releases_latest(client):
    response = client.get("/api/website/releases/latest")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert "windows_url" in data
    assert "macos_url" in data
    assert "linux_url" in data


def test_website_download_tracking(client):
    response = client.post(
        "/api/website/downloads/track",
        json={"platform": "windows", "version": "1.0.0", "file_name": "AlphaVoice-Setup.exe"},
    )
    assert response.status_code == 200
    assert response.json().get("status") == "ok"


def test_website_support_inquiry(client):
    response = client.post(
        "/api/website/support/inquire",
        json={
            "name": "Enterprise Buyer",
            "email": "buyer@enterprise.corp",
            "subject": "Custom Deployment License",
            "message": "We need 50 offline licenses for our sound engineering team.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "received"
    assert "ticket_id" in data


def test_customer_registration_and_auth_workflow(client):
    import time
    unique_email = f"customer_{int(time.time() * 1000)}@alphavoice.test"
    reg_res = client.post(
        "/api/website/auth/register",
        json={
            "email": unique_email,
            "password": "SecurePassword123!",
            "full_name": "Audio Engineer Test",
            "company": "SoundLab Ltd",
        },
    )
    assert reg_res.status_code == 200
    token = reg_res.json()["token"]
    assert token

    # Profile retrieval via /customer/profile and /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    profile_res = client.get("/api/website/customer/profile", headers=headers)
    assert profile_res.status_code == 200
    prof = profile_res.json()
    assert prof["user"]["email"] == unique_email
    assert prof["user"]["full_name"] == "Audio Engineer Test"

    me_res = client.get("/api/website/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["user"]["email"] == unique_email

    # Checkout lifetime plan
    checkout_res = client.post(
        "/api/website/customer/checkout",
        headers=headers,
        json={
            "plan_id": "pro_lifetime",
            "plan_name": "Pro Lifetime Commercial",
            "amount": 299.0,
            "billing_cycle": "lifetime",
            "seats": 1,
            "payment_method": "card",
        },
    )
    assert checkout_res.status_code == 200
    checkout_data = checkout_res.json()
    assert checkout_data["status"] == "success"
    assert checkout_data["license_key"].startswith("ALPHA-LIFE-")

    # Re-fetch profile to verify license and purchase persistence
    updated_profile = client.get("/api/website/customer/profile", headers=headers).json()
    assert len(updated_profile["licenses"]) >= 1
    assert len(updated_profile["purchases"]) >= 1
    assert updated_profile["subscription"]["plan_id"] == "pro_lifetime"


def test_admin_stats_and_management(client):
    # Login as default admin
    login_res = client.post(
        "/api/website/auth/login",
        json={"email": "admin@alphavoice.studio", "password": "AlphaAdmin2026!"},
    )
    assert login_res.status_code == 200
    admin_token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin stats
    stats_res = client.get("/api/website/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_revenue_usd" in stats
    assert "total_users" in stats

    # Admin users list
    users_res = client.get("/api/website/admin/users", headers=headers)
    assert users_res.status_code == 200
    assert isinstance(users_res.json(), list)

    # Admin inquiries list
    inq_res = client.get("/api/website/admin/inquiries", headers=headers)
    assert inq_res.status_code == 200
    assert isinstance(inq_res.json(), list)


def test_spa_client_side_routing_fallback(client):
    # Direct GET to public pages should return HTML with 200 OK
    for path in ["/features", "/pricing", "/download", "/account", "/docs", "/about"]:
        res = client.get(path)
        assert res.status_code == 200
        assert "text/html" in res.headers.get("content-type", "")

    # Non-existent asset with extension should 404
    missing_asset_res = client.get("/assets/nonexistent_bundle_12345.js")
    assert missing_asset_res.status_code == 404
