
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from db import get_conn
import secrets
from functools import wraps

load_dotenv()

app = Flask(__name__)
# Allow all origins for /api/* during development
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.post("/api/contact")
def contact():
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"ok": False, "error": "Invalid JSON"}), 400

    # Extract fields
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    country_code = (data.get("country_code") or "").strip()
    company = (data.get("company") or "").strip()
    project_type = (data.get("project_type") or "").strip()
    budget_range = (data.get("budget_range") or "").strip()
    timeline = (data.get("timeline") or "").strip()
    project_details = (data.get("project_details") or "").strip()

    # Validate required
    missing = [f for f in ["name","email","project_type","project_details"] if not locals()[f]]
    if missing:
        return jsonify({"ok": False, "error": f"Missing required fields: {', '.join(missing)}"}), 400

    # Validate Gmail
    import re
    gmail_regex = re.compile(r'^[a-zA-Z0-9._%+-]+@gmail\.com$')
    if not gmail_regex.match(email):
        return jsonify({"ok": False, "error": "Please enter a valid Gmail address"}), 400

    # Save to DB
    try:
        conn = get_conn()
        cur = conn.cursor()
        sql = ("""
            INSERT INTO contact_submissions
            (name, email, phone, country_code, company, project_type, budget_range, timeline, project_details)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """)
        vals = (name, email, phone, country_code, company, project_type, budget_range, timeline, project_details)
        cur.execute(sql, vals)
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        # You can log e for debugging
        return jsonify({"ok": False, "error": "Database error"}), 500

    return jsonify({"ok": True, "message": "Submission saved"}), 200

# -----------------------------
# Admin Auth (simple)
# -----------------------------

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
_active_admin_tokens = set()


def _generate_token():
    return secrets.token_urlsafe(32)


def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        parts = auth_header.split()
        if len(parts) == 2 and parts[0].lower() == "bearer" and parts[1] in _active_admin_tokens:
            return f(*args, **kwargs)
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    return wrapper


@app.post("/api/admin/login")
def admin_login():
    body = request.get_json(silent=True) or {}
    password = (body.get("password") or "").strip()
    if not password:
        return jsonify({"ok": False, "error": "Password required"}), 400
    if password != ADMIN_PASSWORD:
        return jsonify({"ok": False, "error": "Invalid credentials"}), 401
    token = _generate_token()
    _active_admin_tokens.add(token)
    return jsonify({"ok": True, "token": token}), 200


@app.get("/api/admin/submissions")
@require_admin
def list_submissions():
    try:
        limit = int(request.args.get("limit", "200"))
        offset = int(request.args.get("offset", "0"))
        if limit < 1 or limit > 1000:
            limit = 200
        if offset < 0:
            offset = 0
    except Exception:
        limit, offset = 200, 0

    try:
        conn = get_conn()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            (
                "SELECT id, name, email, phone, country_code, company, project_type, budget_range, timeline, "
                "project_details, created_at FROM contact_submissions ORDER BY created_at DESC "
                "LIMIT %s OFFSET %s"
            ),
            (limit, offset),
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify({"ok": True, "submissions": rows}), 200
    except Exception:
        return jsonify({"ok": False, "error": "Database error"}), 500


@app.get("/api/admin/export/pdf")
@require_admin
def export_submissions_pdf():
    # Import lazily so the app can still run if reportlab isn't installed
    try:
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import mm, inch
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
    except Exception as e:
        return (
            jsonify({
                "ok": False,
                "error": f"PDF export requires reportlab. Install with: pip install reportlab. Error: {str(e)}",
            }),
            500,
        )

    # Fetch data
    try:
        conn = get_conn()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT id, name, email, phone, company, project_type, budget_range, timeline, project_details, created_at "
            "FROM contact_submissions ORDER BY created_at DESC LIMIT 1000"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
    except Exception as e:
        return jsonify({"ok": False, "error": f"Database error: {str(e)}"}), 500

    # Build PDF in memory
    from io import BytesIO

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4))
    story = []

    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=getSampleStyleSheet()['Heading1'],
        fontSize=18,
        spaceAfter=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#111827")
    )
    title = Paragraph("Taskletix - Contact Submissions Report", title_style)
    story.append(title)
    story.append(Spacer(1, 12))

    # Prepare table data
    table_data = []
    
    # Header row
    headers = [
        "ID", "Name", "Email", "Phone", "Company", 
        "Project Type", "Budget Range", "Timeline", "Created Date", "Project Details"
    ]
    table_data.append(headers)
    
    # Data rows
    for row in rows:
        # Format the created_at date
        created_date = row['created_at'].strftime("%Y-%m-%d %H:%M") if row['created_at'] else ""
        
        # Truncate long text fields to prevent table overflow
        project_details = (row['project_details'] or "")[:100] + "..." if len(row['project_details'] or "") > 100 else (row['project_details'] or "")
        
        table_row = [
            str(row['id']),
            str(row['name'])[:30],
            str(row['email'])[:40],
            str(row['phone'] or "")[:20],
            str(row['company'] or "")[:25],
            str(row['project_type'] or "")[:20],
            str(row['budget_range'] or "")[:15],
            str(row['timeline'] or "")[:15],
            created_date,
            project_details
        ]
        table_data.append(table_row)

    # Create table
    table = Table(table_data, repeatRows=1)
    
    # Define column widths for landscape A4
    col_widths = [0.5*inch, 1.2*inch, 1.5*inch, 1*inch, 1.2*inch, 1*inch, 0.8*inch, 0.8*inch, 1*inch, 2*inch]
    table.setStyle(TableStyle([
        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#374151")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        
        # Data row styling
        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        
        # Alternating row colors
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        
        # Grid lines
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#D1D5DB")),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor("#111827")),
        
        # Text wrapping for long content
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    
    story.append(table)
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)

    return (
        buffer.read(),
        200,
        {
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=taskletix_submissions.pdf",
        },
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
