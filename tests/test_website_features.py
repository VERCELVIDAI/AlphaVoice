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


def test_timeline_plans_and_gst_checkout(client):
    import time
    unique_email = f"gst_client_{int(time.time() * 1000)}@alphavoice.test"
    reg = client.post(
        "/api/website/auth/register",
        json={
            "email": unique_email,
            "password": "GstPassword123!",
            "full_name": "Studio Director",
            "company": "Cinematic Audio Studio",
        },
    ).json()
    token = reg["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test 6-Month Plan (₹17,000 + 18% GST = ₹20,060)
    res_6m = client.post(
        "/api/website/customer/checkout",
        headers=headers,
        json={
            "plan_id": "6months",
            "plan_name": "AlphaVoice 6 Months Commercial License",
            "amount": 20060.0,
            "base_amount": 17000.0,
            "gst_amount": 3060.0,
            "currency": "INR",
            "billing_cycle": "6months",
            "duration_months": 6,
            "seats": 1,
            "payment_method": "upi",
            "gstin": "07AAAAA0000A1Z5",
        },
    )
    assert res_6m.status_code == 200
    data_6m = res_6m.json()
    assert data_6m["status"] == "success"
    assert data_6m["license_key"].startswith("ALPHA-6M-")
    assert data_6m["currency"] == "INR"
    assert data_6m["duration_months"] == 6

    # 2. Test Custom Duration (e.g. 5 Months)
    res_custom = client.post(
        "/api/website/customer/checkout",
        headers=headers,
        json={
            "plan_id": "custom",
            "plan_name": "AlphaVoice 5 Months Custom License",
            "amount": 17700.0,
            "base_amount": 15000.0,
            "gst_amount": 2700.0,
            "currency": "INR",
            "billing_cycle": "custom",
            "duration_months": 5,
            "seats": 1,
            "payment_method": "card",
        },
    )
    assert res_custom.status_code == 200
    data_custom = res_custom.json()
    assert data_custom["status"] == "success"
    assert data_custom["license_key"].startswith("ALPHA-5M-")
    assert data_custom["duration_months"] == 5


def test_download_security_and_license_gating(client):
    import time
    # 1. Unauthenticated access check -> has_access: False
    check_unauth = client.get("/api/website/downloads/check-access").json()
    assert check_unauth["has_access"] is False
    assert check_unauth["authenticated"] is False

    # 2. Secure download without auth -> 401
    sec_unauth = client.get("/api/website/downloads/secure?platform=windows")
    assert sec_unauth.status_code == 401

    # 3. New registered user without paid license -> has_access: False, secure download 403
    unpaid_email = f"unpaid_{int(time.time() * 1000)}@alphavoice.test"
    reg = client.post(
        "/api/website/auth/register",
        json={"email": unpaid_email, "password": "Password123!", "full_name": "Unpaid Visitor"},
    ).json()
    token = reg["token"]
    headers = {"Authorization": f"Bearer {token}"}

    check_unpaid = client.get("/api/website/downloads/check-access", headers=headers).json()
    assert check_unpaid["has_access"] is False
    assert check_unpaid["authenticated"] is True

    sec_unpaid = client.get("/api/website/downloads/secure?platform=windows", headers=headers)
    assert sec_unpaid.status_code == 403
    assert "Active commercial license required" in sec_unpaid.json()["detail"]

    # 4. User purchases 1 Year Commercial License -> has_access: True, secure download authorized
    client.post(
        "/api/website/customer/checkout",
        headers=headers,
        json={
            "plan_id": "1year",
            "plan_name": "AlphaVoice 1 Year Commercial License",
            "amount": 35400.0,
            "base_amount": 30000.0,
            "gst_amount": 5400.0,
            "currency": "INR",
            "billing_cycle": "1year",
            "duration_months": 12,
            "seats": 1,
            "payment_method": "netbanking",
        },
    )

    check_paid = client.get("/api/website/downloads/check-access", headers=headers).json()
    assert check_paid["has_access"] is True
    assert check_paid["license_key"].startswith("ALPHA-12M-")

    sec_paid = client.get("/api/website/downloads/secure?platform=windows", headers=headers)
    assert sec_paid.status_code == 200
    assert sec_paid.json()["status"] == "authorized"
    assert "AlphaVoice-Setup" in sec_paid.json()["download_url"]


def test_spa_client_side_routing_fallback(client):
    # Direct GET to public pages and newly built legal pages should return HTML with 200 OK
    for path in [
        "/features",
        "/pricing",
        "/download",
        "/account",
        "/docs",
        "/about",
        "/contact",
        "/terms",
        "/privacy",
        "/refund-policy",
        "/delivery-policy",
        "/license-agreement",
    ]:
        res = client.get(path)
        assert res.status_code == 200
        assert "text/html" in res.headers.get("content-type", "")

    # Non-existent asset with extension should 404
    missing_asset_res = client.get("/assets/nonexistent_bundle_12345.js")
    assert missing_asset_res.status_code == 404


def test_auth_validation_and_password_reset_flow(client):
    import time
    timestamp = int(time.time() * 1000)
    test_email = f"test_user_{timestamp}@alphavoice.test"

    # 1. Registration validation failures
    res_bad_email = client.post(
        "/api/website/auth/register",
        json={"email": "notanemail", "password": "validPass123", "full_name": "Test User"},
    )
    assert res_bad_email.status_code == 400

    res_short_pwd = client.post(
        "/api/website/auth/register",
        json={"email": test_email, "password": "123", "full_name": "Test User"},
    )
    assert res_short_pwd.status_code in (400, 422)

    # 2. Successful registration
    reg_res = client.post(
        "/api/website/auth/register",
        json={
            "email": test_email,
            "password": "InitialPassword123!",
            "full_name": "Test Auth User",
            "company": "Audio Works",
        },
    )
    assert reg_res.status_code == 200
    data = reg_res.json()
    assert "token" in data
    assert data["user"]["email"] == test_email
    assert data["user"]["full_name"] == "Test Auth User"

    # 3. Duplicate registration should return 400
    res_dup = client.post(
        "/api/website/auth/register",
        json={
            "email": test_email,
            "password": "AnotherPassword123!",
            "full_name": "Duplicate User",
        },
    )
    assert res_dup.status_code == 400
    assert "already exists" in res_dup.json()["detail"].lower()

    # 4. Login validation
    res_bad_login = client.post(
        "/api/website/auth/login",
        json={"email": test_email, "password": "WrongPassword999!"},
    )
    assert res_bad_login.status_code == 401

    res_good_login = client.post(
        "/api/website/auth/login",
        json={"email": test_email, "password": "InitialPassword123!"},
    )
    assert res_good_login.status_code == 200
    assert "token" in res_good_login.json()

    # 5. Forgot Password & Reset Password Workflow
    forgot_res = client.post(
        "/api/website/auth/forgot-password",
        json={"email": test_email},
    )
    assert forgot_res.status_code == 200
    reset_token = forgot_res.json().get("debug_reset_token")
    assert reset_token and reset_token.startswith("rst_")

    # Reset with invalid token
    invalid_reset = client.post(
        "/api/website/auth/reset-password",
        json={"token": "rst_fakeinvalidtoken12345", "new_password": "NewUpdatedPassword456!"},
    )
    assert invalid_reset.status_code == 400

    # Reset with valid token
    valid_reset = client.post(
        "/api/website/auth/reset-password",
        json={"token": reset_token, "new_password": "NewUpdatedPassword456!"},
    )
    assert valid_reset.status_code == 200

    # Token cannot be reused
    reused_reset = client.post(
        "/api/website/auth/reset-password",
        json={"token": reset_token, "new_password": "AnotherAttempt123!"},
    )
    assert reused_reset.status_code == 400

    # Old password no longer works
    old_login = client.post(
        "/api/website/auth/login",
        json={"email": test_email, "password": "InitialPassword123!"},
    )
    assert old_login.status_code == 401

    # New password works
    new_login = client.post(
        "/api/website/auth/login",
        json={"email": test_email, "password": "NewUpdatedPassword456!"},
    )
    assert new_login.status_code == 200
    assert "token" in new_login.json()


def test_public_website_pages_routing():
    from main import _is_public_path, _PUBLIC_PAGES

    expected_routes = [
        "/website",
        "/features",
        "/pricing",
        "/download",
        "/docs",
        "/about",
        "/contact",
        "/terms",
        "/privacy",
        "/refund-policy",
        "/delivery-policy",
        "/license-agreement",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/account",
        "/admin/website",
        "/portal",
        "/store",
        "/pro",
    ]
    for route in expected_routes:
        assert route in _PUBLIC_PAGES, f"Route {route} missing from _PUBLIC_PAGES"
        assert _is_public_path(route), f"Route {route} not recognized as public path"
        assert _is_public_path(f"{route}/"), f"Route {route}/ with trailing slash not recognized"
        assert _is_public_path(f"{route}?token=123"), f"Route {route}?token=123 not recognized"
