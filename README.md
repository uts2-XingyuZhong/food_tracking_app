# 🌐 Accessing the App from Other Devices (Mac)

This application runs on a local server.  
To access it from another device on the same Wi-Fi network, follow the steps below.

---

## ① Find Your Local IP Address

Open **Terminal** and run:

```bash
ipconfig getifaddr en0
```

## ② On another device connected to the same Wi-Fi network, open a browser and enter:


```bash
http://<YOUR_IP_ADDRESS>:3000
```