import torch.nn as nn
import torch
import numpy as np
import pandas as pd # Make sure to import pandas

def predict_next_n_days(initial_sequence, n_days, model, device):
    """
    Iteratively predicts the next n days by feeding the model its own output.

    Args:
        initial_sequence (np.ndarray): The starting sequence of data (shape: [seq_length, num_features]).
        n_days (int): Number of days to predict into the future.
        model: Trained PyTorch model.
        device: Device to run predictions on ('cuda' or 'cpu').

    Returns:
        np.ndarray: An array of predicted prices for the next n days.
    """
    predictions = []
    
    # Convert initial numpy sequence to a PyTorch tensor and add a batch dimension
    current_sequence = torch.FloatTensor(initial_sequence).unsqueeze(0).to(device)
    
    with torch.no_grad():
        for _ in range(n_days):
            # 1. Get the model's prediction for the next day
            next_day_prediction = model(current_sequence)
            
            # Extract the single predicted value
            predicted_value = next_day_prediction.cpu().numpy()[0, 0]
            predictions.append(predicted_value)
            
            # 2. Prepare the new sequence for the next iteration
            # Get the current sequence without the batch dimension and convert to numpy
            sequence_as_np = current_sequence.cpu().numpy()[0]
            
            # Create a new row for the predicted day. We assume other features
            # can be carried over from the last known day.
            new_row = sequence_as_np[-1].copy()
            new_row[0] = predicted_value  # Update the first column (price) with the prediction
            
            # 3. Roll the sequence window forward: drop the oldest day and append the new predicted day
            new_sequence_np = np.vstack([sequence_as_np[1:], new_row])
            
            # Convert back to a tensor for the next model input
            current_sequence = torch.FloatTensor(new_sequence_np).unsqueeze(0).to(device)
            
    return np.array(predictions)


def get_predictions_for_entity_single(model, entity_name, entity_data, features, seq_length, start_date, end_date, price_scaler, device):
    """
    Get predicted prices for a specific entity for a given date range.
    This function uses the data *before* the start_date to initialize the prediction.

    Args:
        model: Trained LSTM model.
        entity_name (str): Name of the entity for which predictions are required.
        entity_data (pd.DataFrame): DataFrame with scaled data for the specific entity. 
                                    MUST have a DatetimeIndex.
        features (list): List of feature column names.
        seq_length (int): Length of the input sequence for the model (e.g., 60).
        start_date (str or pd.Timestamp): The first day of the prediction period.
        end_date (str or pd.Timestamp): The last day of the prediction period.
        price_scaler: Scaler used for price normalization (for inverse transforming).
        device: Device to run predictions on ('cuda' or 'cpu').

    Returns:
        np.ndarray or str: Array of predicted prices or an error message string.
    """
    # --- Step 1: Validate inputs and calculate number of prediction days ---
    try:
        start_date_ts = pd.to_datetime(start_date)
        end_date_ts = pd.to_datetime(end_date)
        if start_date_ts > end_date_ts:
            return "Error: Start date cannot be after the end date."
        # Calculate the number of days to predict, inclusive of the end date
        n_days = len(pd.date_range(start=start_date_ts, end=end_date_ts, freq='D'))
    except Exception as e:
        return f"Error parsing dates: {e}"

    # --- Step 2: Select the initial sequence for prediction ---
    # This is the core logic change: select data *before* the start_date.
    # It assumes 'entity_data' has a DatetimeIndex.
    data_before_start = entity_data.loc[entity_data.index < start_date_ts]

    if len(data_before_start) < seq_length:
        return f"Insufficient data for {entity_name}. Need at least {seq_length} days of data before {start_date} to make a prediction, but only found {len(data_before_start)}."

    # Get the last `seq_length` days of known data before the prediction start date
    # .values converts the DataFrame slice to a NumPy array
    initial_sequence = data_before_start[features].iloc[-seq_length:].values
    
    # --- Step 3: Make predictions ---
    scaled_predictions = predict_next_n_days(initial_sequence, n_days, model, device)

    # --- Step 4: Inverse transform the predictions to get actual prices ---
    # Reshape for the scaler, inverse transform, and then flatten back to a 1D array
    predictions = price_scaler.inverse_transform(scaled_predictions.reshape(-1, 1)).flatten()
    
    return predictions


def predict_one_entity(model, device, entity, entity_groups, features, seq_length, start_date, end_date, price_scaler, weather_scaler):
    """
    Wrapper function to predict prices for a single entity by name.
    
    Prerequisite: The DataFrames inside 'entity_groups' must have a DatetimeIndex.
    """
    entity_name = entity
    entity_data = entity_groups.get(entity_name)
    
    if entity_data is None:
        return f"Error: Entity '{entity_name}' not found in entity_groups."
        
    # The weather_scaler is not passed down because it's assumed that the 
    # 'entity_data' DataFrame is already pre-processed and scaled.
    return get_predictions_for_entity_single(
        model=model, 
        entity_name=entity_name, 
        entity_data=entity_data, 
        features=features, 
        seq_length=seq_length, 
        start_date=start_date, 
        end_date=end_date, 
        price_scaler=price_scaler,
        device=device
    )