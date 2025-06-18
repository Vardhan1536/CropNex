![image](https://github.com/user-attachments/assets/912cd85a-38c3-46de-8bc7-d308f9b52f08)# Cropnex: AI-Powered LSTM Model for Commodity Price Prediction

## Introduction

Cropnex is an AI-based solution designed to assist Indian farmers by predicting daily commodity prices across 550 market centers and 22 different commodities. By utilizing over a decade of historical price data, real-time weather data, and import/export trends, we built a robust LSTM-based system that helps farmers make data-driven decisions — from when to sell their produce to exploring nearby market options.

---

## Use Case

### Objective

To empower farmers with AI-driven price forecasts that enable better planning, negotiation, and profit maximization.

---

##  Features

### 1. Price Prediction Module
- Predicts prices for 22 commodities using:
  -  Historical pricing data (10+ years)
  -  Weather parameters (rainfall, temperature, humidity)
  -  Import/export statistics
- Delivers **daily predictions** to assist with selling strategies.

### 2. Visualization
-  Interactive price growth trend graphs
-  Alert boxes for:
- Sudden price spikes or drops

### 3. Market Insights Module
- Suggests nearby buying/selling options within a configurable radius
- Matches real-time **supply and demand**

### 4. Farmer-Centric Web Platform
-  User-friendly interface
-  Visual price trends and predictions
-  Buying/selling suggestions and alerts

---

## 🖼️ Visual Preview
### Home Page
![image](https://github.com/user-attachments/assets/ce59a4b9-0084-47fe-8cf5-95a11784587e)
### Price Prediction
![image](https://github.com/user-attachments/assets/e876c11d-4a0f-402b-993b-bf690b0d038b)
![image](https://github.com/user-attachments/assets/71b28009-4a03-4978-96c9-53d862c387a8)
![image](https://github.com/user-attachments/assets/cedde6d9-dfb0-45a6-a0f9-0158987e6b4a)
### Market Suggestions
![image](https://github.com/user-attachments/assets/fc37e7e2-9121-4e2d-b6c8-84645797002a)
![image](https://github.com/user-attachments/assets/14f1ac0f-ca29-45e6-8571-a7256149e893)
![image](https://github.com/user-attachments/assets/fb10e915-bb88-42a5-b23d-5ecf46eba0c2)
![image](https://github.com/user-attachments/assets/970893e0-776c-4eb7-9537-84974580dbb3)

### Alerts 
![image](https://github.com/user-attachments/assets/14d81d72-7928-43cb-97f9-3efb015f5de5)
### Model Training and Metrics
![image](https://github.com/user-attachments/assets/de296742-6392-4e17-97de-9efa9206a307)
![image](https://github.com/user-attachments/assets/47f56bb8-c559-49ad-98d7-d0513c6d492d)


---

## Technical Overview

###  Data Sources
- **Historical Price Data:** From 550 centers, spanning the last decade taking from AgMarket
- **Weather Data:** Scraped via APIs and online sources
- **Import/Export Stats:** From government and open datasets

### Modeling Approach
- **Model:** Bidirectional LSTM with Attention
- **Input:** 60-day sequences combining commodity, weather, and trade data
- **Training Techniques:**
  - AdamW optimizer
  - Gradient clipping
  - Learning rate scheduling
- **Output:** Predicted next-day price

---

## 🛠 Tech Stack

### Backend
-  PyTorch LSTM model
-  REST API for predictions and analytics
-  FastAPI

### Frontend
-  React-based web app
-  Graphs using D3.js or Chart.js
-  Alert Boxes for market risk indicators

### Database
-  Relational DB: For user data and interactions
-  NoSQL DB: For weather/import-export storage

---

##  Conclusion

Cropnex bridges the gap between modern AI and traditional agriculture by equipping farmers with timely, localized, and actionable insights. With its predictive LSTM model and easy-to-use interface, the platform creates a real-world impact by reducing reliance on middlemen and increasing transparency.

---

## 🧑‍💻 Contributors

- Balavardhan Tummalcherla
- Tanmayi Kona
- Maruthi Kumar Gude
- Diwakar Swarna
- Karthik Manuru
- Nanda Kishore Kalavathula

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

