import pandas as pd
import numpy as np
from sklearn.calibration import LabelEncoder
import torch
import torch.nn as nn
import matplotlib.pyplot as plt
from lstm import LSTMWithAttention
from sklearn.preprocessing import MinMaxScaler
import sys
import json
import warnings

# Suppress specific warning related to torch.load
warnings.filterwarnings("ignore", category=FutureWarning, message=".*torch.load.*")

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Load data
df = pd.read_csv('merged_6.csv')

# Convert date column to datetime and sort data
df['Arrival_Date'] = pd.to_datetime(df['Arrival_Date'], format='%d-%m-%Y')
df = df.sort_values(by='Arrival_Date')

# Feature selection

# Fill missing values
df = df.ffill()

# Feature scaling
price_scaler = MinMaxScaler(feature_range=(0, 1))
df['Modal_Price'] = price_scaler.fit_transform(df['Modal_Price'].values.reshape(-1, 1))

weather_scaler = MinMaxScaler(feature_range=(0, 1))
weather_features = ['rainfall(mm)', 'max_temperature', 'min_temperature']
df[weather_features] = weather_scaler.fit_transform(df[weather_features])

# Sequence length for LSTM
seq_length = 60

df['Entity'] = df['State'] + ' | ' + df['Market'] + ' | ' + df['Commodity']

# Dynamic features selection
features = ['Modal_Price', 'rainfall(mm)', 'max_temperature', 'min_temperature',
            'humidity(%)', 'flood_index', 'drought_index']

# Label encode the 'season' column
label_encoder = LabelEncoder()
df['season_encoded'] = label_encoder.fit_transform(df['season'])
df['entity_encoded'] = LabelEncoder().fit_transform(df['Entity'])
# Add the encoded 'season' column to features
features.append('season_encoded')
features.append('entity_encoded')

entities = df['Entity'].unique()
entity_groups = {entity: df[df['Entity'] == entity] for entity in entities}


# Load the pretrained model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = torch.load('lstm_full_model.pth', map_location=device)
model.eval()
def predict_next_n_days(model, last_sequence, n_days=10, device=device):
    """
    Predict the next n days of prices using the trained model.
    
    Args:
        model: Trained LSTM model
        last_sequence: Last known sequence of data (should be of length seq_length)
        n_days: Number of days to predict (default=10)
        device: Device to run predictions on
        
    Returns:
        Array of predicted prices for the next n days
    """
    model.eval()
    predictions = []
    
    # Convert input sequence to tensor and move to device
    current_sequence = torch.FloatTensor(last_sequence).unsqueeze(0).to(device)
    
    with torch.no_grad():
        for _ in range(n_days):
            # Get prediction for next day
            next_day_prediction = model(current_sequence)
            predictions.append(next_day_prediction.cpu().numpy()[0][0])
            
            # Update sequence for next prediction
            # Remove the oldest day and add the prediction as the newest day
            new_sequence = current_sequence.cpu().numpy()[0][1:]
            # Create new row with the same feature values except the price
            new_row = new_sequence[-1].copy()
            new_row[0] = predictions[-1]  # Update only the price
            
            # Update the current sequence
            current_sequence = torch.FloatTensor(
                np.vstack([new_sequence, new_row])
            ).unsqueeze(0).to(device)
    
    return np.array(predictions)

# Function to make predictions for all entities
def predict_all_entities(model, entity_groups, features, seq_length, n_days=10):
    """
    Make predictions for all entities
    
    Returns:
        Dictionary containing predictions for each entity
    """
    predictions_dict = {}
    
    for entity in entities:
        print(f"\nMaking predictions for {entity}")
        
        # Get the most recent sequence for this entity
        entity_data = entity_groups[entity][features].values
        
        if len(entity_data) >= seq_length:
            # Get the last sequence of known data
            last_known_sequence = entity_data[-seq_length:]
            
            # Make predictions
            scaled_predictions = predict_next_n_days(
                model, last_known_sequence, n_days, device
            )
            
            # Inverse transform the predictions to get actual prices
            predictions = price_scaler.inverse_transform(
                scaled_predictions.reshape(-1, 1)
            ).flatten()
            
            # Store predictions
            predictions_dict[entity] = predictions
            
            # Plot the predictions
            plt.figure(figsize=(12, 6))
            
            # Plot last 30 days of actual data
            last_30_days = price_scaler.inverse_transform(
                entity_data[-30:, 0].reshape(-1, 1)
            ).flatten()
            plt.plot(range(30), last_30_days, 
                    label='Historical Prices', marker='o')
            
            # Plot predictions
            plt.plot(range(29, 29 + n_days), predictions, 
                    label='Predicted Prices', marker='x', 
                    linestyle='--', color='red')
            
            plt.title(f'Price Predictions for {entity}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            plt.grid(True)
            plt.show()
            
            # Print predicted values
            print("\nPredicted prices for next 10 days:")
            for i, price in enumerate(predictions, 1):
                print(f"Day {i}: {price:.2f}")
        else:
            print(f"Insufficient data for {entity} to make predictions")
    
    return predictions_dict

# # Make predictions for all entities
# predictions = predict_all_entities(model, entity_groups, features, seq_length)

# # Save predictions to CSV
# prediction_df = pd.DataFrame.from_dict(predictions, orient='index')
# prediction_df.columns = [f'Day_{i+1}' for i in range(10)]
# prediction_df.to_csv('price_predictions.csv')
# print("\nPredictions saved to 'price_predictions.csv'")

def get_predictions_for_entity_single(model, entity_name, entity_data, features, seq_length, n_days=10, price_scaler=price_scaler, weather_scaler=weather_scaler, device=device):
    """
    Get the predicted prices for a specific entity on-demand without running predict_all_entities().
    
    Args:
        model: Trained LSTM model
        entity_name: Name of the entity for which predictions are required
        entity_data: Data for the specific entity
        features: List of features to be used
        seq_length: Length of the input sequence
        n_days: Number of days to predict
        price_scaler: Scaler used for price normalization
        weather_scaler: Scaler used for weather normalization
        device: Device to run predictions on
        
    Returns:
        Array of predicted prices for the specified entity
    """
    # Ensure data is properly preprocessed for the selected entity
    entity_data = entity_data[features].values

    if len(entity_data) >= seq_length:
        # Get the last sequence of known data
        last_known_sequence = entity_data[-seq_length:]
        
        # Make predictions
        scaled_predictions = predict_next_n_days(model, last_known_sequence, n_days, device)

        # Inverse transform the predictions to get actual prices
        predictions = price_scaler.inverse_transform(scaled_predictions.reshape(-1, 1)).flatten()
        
        # # Plot the predictions (optional)
        # plt.figure(figsize=(12, 6))

        # # Plot last 30 days of actual data
        # last_30_days = price_scaler.inverse_transform(entity_data[-30:, 0].reshape(-1, 1)).flatten()
        # plt.plot(range(30), last_30_days, label='Historical Prices', marker='o')

        # # Plot predictions
        # plt.plot(range(29, 29 + n_days), predictions, label='Predicted Prices', marker='x', linestyle='--', color='red')

        # plt.title(f'Price Predictions for {entity_name}')
        # plt.xlabel('Days')
        # plt.ylabel('Price')
        # plt.legend()
        # plt.grid(True)
        # plt.show()

        # Print predicted values
        # print(f"\nPredicted prices for {entity_name} for the next {n_days} days:")
        # for i, price in enumerate(predictions, 1):
        #     print(f"Day {i}: {price:.2f}")
            
        
        return predictions
    else:
        return f"Insufficient data for {entity_name} to make predictions"
    
def predict_one_entity(entity):
    entity_name = entity
    entity_data = entity_groups.get(entity_name)
    return get_predictions_for_entity_single(model, entity_name, entity_data, features, seq_length)

# # Example entity name
# entity_name = 'Andhra Pradesh | Alur | Onion'

# # Get the data for the specific entity from the entity_groups
# entity_data = entity_groups.get(entity_name)

# # Check if the entity exists in the entity_groups
# if entity_data is not None:
#     # Get predictions for the entity
#     predicted_prices = get_predictions_for_entity_single(model, entity_name, entity_data, features, seq_length)
# else:
#     print(f"Entity '{entity_name}' not found in the dataset.")
    
# predict_one_entity('Andhra Pradesh | Alur | Onion')


if __name__ == "__main__":
    entity = sys.argv[1]
    predictions = predict_one_entity(entity)
    
    # Convert the predictions to a list before serializing to JSON
    predictions_list = predictions.tolist() if isinstance(predictions, np.ndarray) else predictions
    
    # Print the predictions as JSON
    print(json.dumps(predictions_list))
