@echo off
echo installing HTTPS - WebSocket transposer
start python3 -m pip install -r requirements.txt
echo transposer installed
echo running
start pyhton3 .\main.py
