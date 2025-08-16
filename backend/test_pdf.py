#!/usr/bin/env python3
"""
Test script for PDF generation functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from db import get_conn

def test_pdf_generation():
    """Test the PDF generation endpoint"""
    print("Testing PDF generation...")
    
    # Test with app context
    with app.test_client() as client:
        # First, we need to login to get a token
        login_response = client.post('/api/admin/login', 
                                   json={'password': 'admin123'})
        
        if login_response.status_code != 200:
            print("❌ Login failed:", login_response.get_json())
            return False
            
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test PDF export
        pdf_response = client.get('/api/admin/export/pdf', headers=headers)
        
        if pdf_response.status_code == 200:
            print("✅ PDF generation successful!")
            print(f"   Content-Type: {pdf_response.headers.get('Content-Type')}")
            print(f"   Content-Length: {len(pdf_response.data)} bytes")
            print(f"   Filename: {pdf_response.headers.get('Content-Disposition')}")
            return True
        else:
            print("❌ PDF generation failed:")
            print(f"   Status: {pdf_response.status_code}")
            try:
                error_data = pdf_response.get_json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Response: {pdf_response.data}")
            return False

def test_database_connection():
    """Test database connection"""
    print("Testing database connection...")
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM contact_submissions")
        count = cur.fetchone()[0]
        cur.close()
        conn.close()
        print(f"✅ Database connection successful! Found {count} submissions")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("=== PDF Generation Test ===\n")
    
    # Test database first
    if not test_database_connection():
        print("\n❌ Cannot proceed without database connection")
        sys.exit(1)
    
    # Test PDF generation
    success = test_pdf_generation()
    
    if success:
        print("\n✅ All tests passed! PDF generation is working correctly.")
    else:
        print("\n❌ Tests failed. Please check the errors above.")
        sys.exit(1)
