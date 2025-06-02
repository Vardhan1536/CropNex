import torch.nn as nn
import torch
import numpy as np


def predict_next_n_days(last_sequence, n_days, model, device):
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
    predictions = []
    
    # Convert input sequence to tensor and move to device
    current_sequence = torch.FloatTensor(last_sequence).unsqueeze(0).to(device)
    
    with torch.no_grad():
        for _ in range(n_days):
            # Get prediction for next day
            next_day_prediction = model(current_sequence)
            predictions.append(next_day_prediction.cpu().numpy()[0][0])
            
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


def get_predictions_for_entity_single(model, entity_name, entity_data, features, seq_length, n_days, price_scaler, weather_scaler, device):
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
    entity_data = entity_data[features].values
    n_days = int(n_days)

    if len(entity_data) >= seq_length:
        # Get the last sequence of known data
        last_known_sequence = entity_data[-seq_length:]
        
        # Make predictions
        scaled_predictions = predict_next_n_days(last_known_sequence, n_days, model, device)

        # Inverse transform the predictions to get actual prices
        predictions = price_scaler.inverse_transform(scaled_predictions.reshape(-1, 1)).flatten()
        
        return predictions
    else:
        return f"Insufficient data for {entity_name} to make predictions"

def predict_one_entity(model, device, entity,entity_groups,features,seq_length,num_days,price_scaler,weather_scaler):
    entity_name = entity
    entity_data = entity_groups.get(entity_name)
   
    return get_predictions_for_entity_single(model, entity_name, entity_data, features, seq_length,num_days,price_scaler,weather_scaler,device)