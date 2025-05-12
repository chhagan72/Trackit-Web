import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("C:\Users\ramch\OneDrive\Desktop\trackit\trackits-ea795-firebase-adminsdk-fbsvc-acf8274cd0.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://your-database-name.firebaseio.com'
})
