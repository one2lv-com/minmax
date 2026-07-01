import cv2
import requests
import time

API="http://localhost:3000/api/deploy"
TOKEN=open("/data/data/com.termux/files/home/.one2lv_token").read().strip()

cap=cv2.VideoCapture(0)

while True:

    ret,frame=cap.read()

    if not ret:
        continue

    gray=cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)

    brightness=gray.mean()

    print("Brightness:",brightness)

    if brightness<40:

        requests.post(
            API,
            headers={"Authorization":"Bearer "+TOKEN},
            json={"cmd":"LOW_LIGHT_EVENT"}
        )

    time.sleep(1)
