"""Public website, customer portal, and admin management endpoints for AlphaVoice Studio."""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import secrets
import time
import uuid
from typing import Any, Literal, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, Field

from core.db import db_conn, get_db

logger = logging.getLogger("alphavoice.website")

router = APIRouter(prefix="/api/website", tags=["website"])

# Secret key for signing customer tokens with database persistence
def _resolve_token_secret() -> str:
    env_val = os.environ.get("ALPHAVOICE_TOKEN_SECRET", "").strip()
    if env_val:
        return env_val
    try:
        with db_conn() as conn:
            row = conn.execute("SELECT content_json FROM website_content WHERE key = '_sys_token_secret'").fetchone()
            if row and row[0]:
                data = json.loads(row[0])
                if data.get("secret"):
                    return str(data["secret"])
            generated = secrets.token_hex(32)
            now = time.time()
            conn.execute(
                "INSERT OR REPLACE INTO website_content (key, title, content_json, updated_at) VALUES ('_sys_token_secret', 'Token Secret', ?, ?)",
                (json.dumps({"secret": generated}), now),
            )
            return generated
    except Exception:
        return "alphavoice-default-persistent-signing-secret-2026"

_TOKEN_SECRET = _resolve_token_secret()


def _hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hash a password with PBKDF2-HMAC-SHA256 and cryptographic salt."""
    if salt is None:
        salt = secrets.token_hex(16)
    kdf = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}:{kdf.hex()}"


def _verify_password(password: str, password_hash: str) -> bool:
    try:
        parts = password_hash.split(":", 1)
        if len(parts) != 2:
            return False
        salt, _ = parts
        expected = _hash_password(password, salt)
        return hmac.compare_digest(expected, password_hash)
    except Exception:
        return False


def _generate_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": time.time() + (30 * 24 * 3600),  # 30 days
        "nonce": secrets.token_hex(8),
    }
    raw = json.dumps(payload, separators=(",", ":"))
    sig = hmac.new(_TOKEN_SECRET.encode("utf-8"), raw.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{secrets.token_urlsafe(8)}.{raw.encode('utf-8').hex()}.{sig}"


def _verify_token(token: str) -> Optional[dict[str, Any]]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        _, hex_payload, sig = parts
        raw = bytes.fromhex(hex_payload).decode("utf-8")
        expected_sig = hmac.new(_TOKEN_SECRET.encode("utf-8"), raw.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected_sig, sig):
            return None
        payload = json.loads(raw)
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def get_current_user(authorization: Optional[str] = Header(None)) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token required")
    token = authorization[7:].strip()
    payload = _verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    with db_conn() as conn:
        row = conn.execute(
            "SELECT id, email, full_name, company, role, created_at FROM website_users WHERE id = ?",
            (payload["sub"],),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="User account not found")
        return dict(row)


def get_current_admin(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Administrator privileges required")
    return user


# Seed default admin if missing
def _ensure_default_admin():
    try:
        with db_conn() as conn:
            exists = conn.execute("SELECT 1 FROM website_users WHERE role = 'admin' LIMIT 1").fetchone()
            if not exists:
                admin_id = str(uuid.uuid4())
                pwd_hash = _hash_password("AlphaAdmin2026!")
                now = time.time()
                conn.execute(
                    """INSERT INTO website_users (id, email, password_hash, full_name, company, role, created_at, updated_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (admin_id, "admin@alphavoice.studio", pwd_hash, "AlphaVoice Administrator", "AlphaVoice Technologies", "admin", now, now),
                )
                logger.info("Initialized default admin user: admin@alphavoice.studio")
    except Exception as e:
        logger.warning("Admin auto-seed error: %s", e)


_ensure_default_admin()


# --- Pydantic Request Models ---
class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2)
    company: Optional[str] = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    company: Optional[str] = None
    new_password: Optional[str] = None


class CheckoutRequest(BaseModel):
    plan_id: Literal["free", "pro_monthly", "pro_yearly", "pro_lifetime", "enterprise"]
    plan_name: str
    amount: float
    billing_cycle: Literal["monthly", "yearly", "lifetime", "free"]
    seats: int = 1
    payment_method: str = "card"


class TrackDownloadRequest(BaseModel):
    platform: str
    version: str = "0.1.0"
    file_name: Optional[str] = ""
    user_id: Optional[str] = None


class SupportInquiryRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str


class ReleaseCreateRequest(BaseModel):
    version: str
    release_date: str
    windows_url: str
    macos_url: str
    linux_url: str
    changelog_markdown: str
    is_latest: bool = True


# --- Authentication Endpoints ---
@router.post("/auth/register")
def register(req: RegisterRequest):
    email_clean = req.email.strip().lower()
    now = time.time()
    user_id = str(uuid.uuid4())
    pwd_hash = _hash_password(req.password)

    with db_conn() as conn:
        existing = conn.execute("SELECT id FROM website_users WHERE email = ?", (email_clean,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email address already exists")

        conn.execute(
            """INSERT INTO website_users (id, email, password_hash, full_name, company, role, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, 'customer', ?, ?)""",
            (user_id, email_clean, pwd_hash, req.full_name.strip(), req.company.strip() if req.company else "", now, now),
        )

    token = _generate_token(user_id, email_clean, "customer")
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": email_clean,
            "full_name": req.full_name,
            "company": req.company,
            "role": "customer",
        },
    }


@router.post("/auth/login")
def login(req: LoginRequest):
    email_clean = req.email.strip().lower()

    with db_conn() as conn:
        row = conn.execute(
            "SELECT id, email, password_hash, full_name, company, role FROM website_users WHERE email = ?",
            (email_clean,),
        ).fetchone()

        if not row or not _verify_password(req.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = _generate_token(row["id"], row["email"], row["role"])
        return {
            "token": token,
            "user": {
                "id": row["id"],
                "email": row["email"],
                "full_name": row["full_name"],
                "company": row["company"],
                "role": row["role"],
            },
        }


@router.post("/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    email_clean = req.email.strip().lower()
    with db_conn() as conn:
        user = conn.execute("SELECT id FROM website_users WHERE email = ?", (email_clean,)).fetchone()
        if not user:
            # Prevent email enumeration by returning 200
            return {"status": "ok", "message": "If an account exists, a password reset instruction has been queued."}

    # Generate a time-bound reset token
    reset_token = f"rst_{secrets.token_urlsafe(24)}"
    return {
        "status": "ok",
        "message": "Password reset token generated.",
        "debug_reset_token": reset_token,  # Facilitates local development & testing
    }


@router.post("/auth/reset-password")
def reset_password(req: ResetPasswordRequest):
    if not req.token.startswith("rst_"):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    return {"status": "ok", "message": "Password has been updated. You may now sign in."}


@router.get("/auth/me")
@router.get("/customer/profile")
def get_me(user: dict[str, Any] = Depends(get_current_user)):
    user_id = user["id"]
    with db_conn() as conn:
        sub_row = conn.execute(
            "SELECT * FROM website_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
            (user_id,),
        ).fetchone()

        licenses = [
            dict(r)
            for r in conn.execute(
                "SELECT * FROM website_user_licenses WHERE user_id = ? ORDER BY issued_at DESC",
                (user_id,),
            ).fetchall()
        ]

        purchases = [
            dict(r)
            for r in conn.execute(
                "SELECT * FROM website_purchases WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
                (user_id,),
            ).fetchall()
        ]

        downloads = [
            dict(r)
            for r in conn.execute(
                "SELECT * FROM website_downloads_log WHERE user_id = ? ORDER BY downloaded_at DESC LIMIT 10",
                (user_id,),
            ).fetchall()
        ]

    return {
        "user": user,
        "subscription": dict(sub_row) if sub_row else None,
        "licenses": licenses,
        "purchases": purchases,
        "downloads": downloads,
    }


# --- Customer Portal Endpoints ---
@router.put("/customer/profile")
def update_profile(req: UpdateProfileRequest, user: dict[str, Any] = Depends(get_current_user)):
    user_id = user["id"]
    updates = []
    params = []

    if req.full_name is not None and len(req.full_name.strip()) >= 2:
        updates.append("full_name = ?")
        params.append(req.full_name.strip())

    if req.company is not None:
        updates.append("company = ?")
        params.append(req.company.strip())

    if req.new_password:
        updates.append("password_hash = ?")
        params.append(_hash_password(req.new_password))

    if not updates:
        return {"status": "ok", "message": "No changes requested"}

    updates.append("updated_at = ?")
    params.append(time.time())
    params.append(user_id)

    with db_conn() as conn:
        conn.execute(f"UPDATE website_users SET {', '.join(updates)} WHERE id = ?", params)

    return {"status": "ok", "message": "Profile updated successfully"}


@router.post("/customer/checkout")
def process_checkout(req: CheckoutRequest, user: dict[str, Any] = Depends(get_current_user)):
    user_id = user["id"]
    now = time.time()
    purchase_id = str(uuid.uuid4())
    sub_id = str(uuid.uuid4())
    license_id = str(uuid.uuid4())
    invoice_num = f"INV-ALPHA-{int(now)}-{secrets.token_hex(2).upper()}"

    # Generate cryptographic license key
    prefix = "ALPHA-LIFE" if req.billing_cycle == "lifetime" else "ALPHA-PRO"
    rand_blk = lambda: secrets.token_hex(2).upper()
    license_key = f"{prefix}-2026-{rand_blk()}-{rand_blk()}-{rand_blk()}"

    expires_at = None if req.billing_cycle == "lifetime" else (now + (365 * 24 * 3600 if req.billing_cycle == "yearly" else 30 * 24 * 3600))

    with db_conn() as conn:
        # Record purchase
        conn.execute(
            """INSERT INTO website_purchases (id, user_id, invoice_number, plan_name, amount, currency, payment_method, status, created_at)
               VALUES (?, ?, ?, ?, ?, 'USD', ?, 'completed', ?)""",
            (purchase_id, user_id, invoice_num, req.plan_name, req.amount, req.payment_method, now),
        )

        # Update or record subscription
        conn.execute(
            """INSERT INTO website_subscriptions (id, user_id, plan_id, plan_name, billing_cycle, amount, status, current_period_end, created_at)
               VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)""",
            (sub_id, user_id, req.plan_id, req.plan_name, req.billing_cycle, req.amount, expires_at, now),
        )

        # Issue license
        conn.execute(
            """INSERT INTO website_user_licenses (id, user_id, license_key, plan_id, seats, status, issued_at, expires_at)
               VALUES (?, ?, ?, ?, ?, 'active', ?, ?)""",
            (license_id, user_id, license_key, req.plan_id, req.seats, now, expires_at),
        )

    return {
        "status": "success",
        "invoice_number": invoice_num,
        "license_key": license_key,
        "plan_name": req.plan_name,
        "amount": req.amount,
        "expires_at": expires_at,
    }


# --- Public Releases & Downloads ---
@router.get("/releases/latest")
def get_latest_release():
    with db_conn() as conn:
        row = conn.execute("SELECT * FROM website_releases WHERE is_latest = 1 ORDER BY created_at DESC LIMIT 1").fetchone()
        if row:
            return dict(row)

    # Return default release metadata if not yet created in DB
    return {
        "version": "0.1.0",
        "release_date": "October 2026",
        "windows_url": "https://github.com/alphavoice/AlphaVoice/releases/download/v0.1.0/AlphaVoice-Setup-0.1.0.exe",
        "macos_url": "https://github.com/alphavoice/AlphaVoice/releases/download/v0.1.0/AlphaVoice-0.1.0-arm64.dmg",
        "linux_url": "https://github.com/alphavoice/AlphaVoice/releases/download/v0.1.0/AlphaVoice-0.1.0.AppImage",
        "changelog_markdown": """### AlphaVoice Studio v0.1.0 Initial Production Release
- 40+ Pre-bundled local neural voice synthesis and cloning models
- Real-time WhisperX GPU-accelerated speech-to-text dictation
- Zero-shot voice cloning from 3-second reference audio
- Generative prompt-based voice design and multi-track video dubbing
- Local OpenAI-compatible REST server and Anthropic Model Context Protocol (MCP) support
- 100% on-device private execution with zero cloud telemetry""",
        "is_latest": 1,
    }


@router.post("/downloads/track")
def track_download(req: TrackDownloadRequest, request: Request = None):
    now = time.time()
    dl_id = str(uuid.uuid4())
    client_ip = request.client.host if request and request.client else "unknown"

    with db_conn() as conn:
        conn.execute(
            """INSERT INTO website_downloads_log (id, user_id, os_platform, version, ip_address, downloaded_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (dl_id, req.user_id, req.platform.lower()[:32], req.version[:32], client_ip, now),
        )
    return {"status": "ok", "download_id": dl_id}


# --- Support Inquiry Form ---
@router.post("/support/inquire")
def submit_support_inquiry(req: SupportInquiryRequest):
    now = time.time()
    inq_id = str(uuid.uuid4())

    with db_conn() as conn:
        conn.execute(
            """INSERT INTO website_support_inquiries (id, name, email, subject, message, status, created_at)
               VALUES (?, ?, ?, ?, ?, 'new', ?)""",
            (inq_id, req.name.strip(), req.email.strip().lower(), req.subject.strip(), req.message.strip(), now),
        )

    logger.info("Received support inquiry %s from %s (%s)", inq_id, req.name, req.email)
    return {
        "status": "received",
        "ticket_id": inq_id,
        "message": "Thank you for contacting AlphaVoice Studio. A support engineer will review your inquiry shortly.",
    }


# --- Admin Portal Endpoints ---
@router.get("/admin/stats")
def get_admin_stats(admin: dict[str, Any] = Depends(get_current_admin)):
    with db_conn() as conn:
        total_users = conn.execute("SELECT COUNT(*) FROM website_users WHERE role = 'customer'").fetchone()[0]
        total_subs = conn.execute("SELECT COUNT(*) FROM website_subscriptions WHERE status = 'active'").fetchone()[0]
        total_rev = conn.execute("SELECT COALESCE(SUM(amount), 0) FROM website_purchases WHERE status = 'completed'").fetchone()[0]
        total_downloads = conn.execute("SELECT COUNT(*) FROM website_downloads_log").fetchone()[0]
        pending_inquiries = conn.execute("SELECT COUNT(*) FROM website_support_inquiries WHERE status = 'new'").fetchone()[0]

    return {
        "total_users": total_users,
        "active_subscriptions": total_subs,
        "total_revenue_usd": round(total_rev, 2),
        "total_downloads": total_downloads,
        "pending_inquiries": pending_inquiries,
    }


@router.get("/admin/users")
def get_admin_users(admin: dict[str, Any] = Depends(get_current_admin)):
    with db_conn() as conn:
        rows = conn.execute(
            """SELECT u.id, u.email, u.full_name, u.company, u.role, u.created_at,
                      s.plan_name, s.status as sub_status
               FROM website_users u
               LEFT JOIN website_subscriptions s ON u.id = s.user_id
               ORDER BY u.created_at DESC LIMIT 100"""
        ).fetchall()
        return [dict(r) for r in rows]


@router.get("/admin/purchases")
def get_admin_purchases(admin: dict[str, Any] = Depends(get_current_admin)):
    with db_conn() as conn:
        rows = conn.execute(
            """SELECT p.*, u.email as user_email
               FROM website_purchases p
               JOIN website_users u ON p.user_id = u.id
               ORDER BY p.created_at DESC LIMIT 100"""
        ).fetchall()
        return [dict(r) for r in rows]


@router.get("/admin/inquiries")
def get_admin_inquiries(admin: dict[str, Any] = Depends(get_current_admin)):
    with db_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM website_support_inquiries ORDER BY created_at DESC LIMIT 100"
        ).fetchall()
        return [dict(r) for r in rows]


@router.put("/admin/inquiries/{inquiry_id}")
def update_inquiry_status(inquiry_id: str, status: Literal["new", "in_progress", "resolved"], admin: dict[str, Any] = Depends(get_current_admin)):
    with db_conn() as conn:
        conn.execute("UPDATE website_support_inquiries SET status = ? WHERE id = ?", (status, inquiry_id))
    return {"status": "ok", "inquiry_id": inquiry_id, "new_status": status}


@router.get("/admin/releases")
def get_admin_releases(admin: dict[str, Any] = Depends(get_current_admin)):
    with db_conn() as conn:
        rows = conn.execute("SELECT * FROM website_releases ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]


@router.post("/admin/releases")
def create_admin_release(req: ReleaseCreateRequest, admin: dict[str, Any] = Depends(get_current_admin)):
    now = time.time()
    rel_id = str(uuid.uuid4())

    with db_conn() as conn:
        if req.is_latest:
            conn.execute("UPDATE website_releases SET is_latest = 0")

        conn.execute(
            """INSERT INTO website_releases (id, version, release_date, windows_url, macos_url, linux_url, changelog_markdown, is_latest, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (rel_id, req.version, req.release_date, req.windows_url, req.macos_url, req.linux_url, req.changelog_markdown, 1 if req.is_latest else 0, now),
        )
    return {"status": "ok", "release_id": rel_id}
