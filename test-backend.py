#!/usr/bin/env python3
"""
Simple test script to verify backend functionality
"""
import requests
import json

BASE_URL = "http://localhost:8001"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_login():
    """Test login endpoint"""
    try:
        login_data = {
            "email": "admin@practicheck.com",
            "password": "Admin123!"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Login: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Login successful! Token: {data['access_token'][:20]}...")
            return data['access_token']
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login failed: {e}")
        return None

def test_billing_universities(token):
    """Test billing universities endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/billing/universities", headers=headers)
        print(f"Billing universities: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} universities")
            if data:
                print(f"First university: {data[0]['name']} - Outstanding: ${data[0].get('outstandingAmount', 0)}")
        else:
            print(f"Billing universities failed: {response.text}")
    except Exception as e:
        print(f"Billing universities failed: {e}")

def main():
    print("Testing PractiCheck Backend...")
    
    # Test health
    if not test_health():
        print("Backend is not healthy!")
        return
    
    # Test login
    token = test_login()
    if not token:
        print("Login failed!")
        return
    
    # Test billing
    test_billing_universities(token)
    
    print("Backend tests completed!")

if __name__ == "__main__":
    main()