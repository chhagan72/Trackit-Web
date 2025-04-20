# from platform import node
import requests
from django.conf import settings

# def get_firebase_data(endpoint):
#     url = f"{settings.FIREBASE_API_URL}{endpoint}.json"
#     response = requests.get(url)
#     if response.status_code == 200:
#         return response.json()
#     else:
#         return None
def get_firebase_data(endpoint):
    try:
        url = f"{settings.FIREBASE_API_URL.rstrip('/')}/{endpoint}.json"
        response = requests.get(url)
        print("API URL:", url)
        print("Response Status:", response.status_code)
        print("Response Data:", response.json())
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except Exception as e:
        print("Exception:", e)
        return None


def write_firebase_data(endpoint, data):
    url = f"{settings.FIREBASE_API_URL}{endpoint}.json"
    response = requests.post(url, json=data)
    return response.json() if response.status_code == 200 else None
    