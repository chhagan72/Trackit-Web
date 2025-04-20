from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='trakit'),
    path('login/', views.login_view, name='login'),
    path('devices/', views.devices_view, name='devices'),
    path('logout/', views.logout_view, name='logout'),
    path('devicehome/<str:device_id>/', views.device_home, name='devicehome'),
    path('profile/<str:device_id>/', views.device_profile, name='device_profile'),
]
