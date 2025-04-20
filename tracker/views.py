from django.shortcuts import render, redirect
from django.contrib import messages
from .utils import get_firebase_data
import hashlib
import logging
from django.http import JsonResponse

def index(request):
    return render(request, 'index.html')

def login_view(request):
    if 'email' in request.session:
        return redirect('/devices')

    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        users = get_firebase_data('Users')  
        if users:
            for uid, user in users.items():
                if user.get('email') == email and user.get('password') == hashed_password:
                    request.session['email'] = email
                    request.session['user_id'] = uid
                    return redirect('/devices')

            messages.error(request, 'Invalid email or password.')
        else:
            messages.error(request, 'No users found.')

    return render(request, 'login.html')

def devices_view(request):
    if 'email' not in request.session:
        messages.error(request, 'Please login first.')
        return redirect('/')

    user_id = request.session.get('user_id')

    # Fetch devices from Firebase
    devices = get_firebase_data(f'users/{user_id}/devices')  

    logging.info(f"Fetched devices for user {user_id}: {devices}")  # Debugging log

    user_devices = {}

    if devices:
        for device_id, device_data in devices.items():
            # Only include devices that have 'deviceName' and 'batteryStatus'
            if 'deviceName' in device_data and 'batteryStatus' in device_data:
                user_devices[device_id] = {
                    'device_name': device_data.get('deviceName', 'Unknown Device'),
                    'battery_status': device_data.get('batteryStatus', 'N/A'),
                    'status': device_data.get('status', 'Unknown'),
                    'device_id': device_id
                }

    return render(request, 'devices.html', {'devices': user_devices})


def device_home(request, device_id):
    user_id = request.session.get('user_id')

    if not user_id:
        return redirect('/login')

    # Fetch device details from Firebase
    device_data = get_firebase_data(f'users/{user_id}/devices/{device_id}')
    
    if not device_data:
        return render(request, 'deviceHome.html', {'error': 'Device not found'})

    # Ensure latitude & longitude exist
    device_data['latitude'] = float(device_data.get('latitude', 0)) if 'latitude' in device_data else None
    device_data['longitude'] = float(device_data.get('longitude', 0)) if 'longitude' in device_data else None

    device_data['device_id'] = device_id
    return render(request, 'deviceHome.html', {'device': device_data, 'device_id': device_id})

def send_command(request, device_id, command):
    try:
        get_firebase_data(f"users/{request.session.get('user_id')}/devices/{device_id}", {command: True})
        return JsonResponse({"status": "success", "message": f"{command} command sent."})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


def logout_view(request):
    request.session.flush()
    return redirect('/')

def live_location_view(request, device_id):
    return render(request, 'live_location.html', {
        'device_id': device_id,
        'firebase_user_id': request.user.id  # Or however you map user IDs
    })


def device_profile(request, device_id):
    users = get_firebase_data('Users/')
    matched_profile = None

    if users:
        for user_id, user_info in users.items():
            devices = user_info.get("devices", {})
            if device_id in devices:
                matched_profile = user_info
                break

    context = {
        'device': matched_profile,
        'device_id': device_id
    }
    return render(request, 'profile.html', context)

