import pandas as pd
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from datetime import datetime, timedelta
import os
import numpy as np

# Ensure the 'predictions.py' file is in the same directory
from predictions import predict_one_entity

def _create_features_and_scalers(df: pd.DataFrame):
    """
    Private helper function to apply scaling and feature engineering to a DataFrame.
    This function is correct and does not need changes.
    """
    if df.empty:
        raise ValueError("Cannot create features and scalers from an empty DataFrame.")
    df_processed = df.copy()
    price_scaler = MinMaxScaler(feature_range=(0, 1))
    df_processed["Modal_Price"] = price_scaler.fit_transform(df_processed["Modal_Price"].values.reshape(-1, 1))
    weather_scaler = MinMaxScaler(feature_range=(0, 1))
    weather_features = ["rainfall(mm)", "max_temperature", "min_temperature"]
    df_processed[weather_features] = weather_scaler.fit_transform(df_processed[weather_features])
    features = ["Modal_Price", "rainfall(mm)", "max_temperature", "min_temperature", "humidity(%)", "flood_index", "drought_index"]
    df_processed["season_encoded"] = LabelEncoder().fit_transform(df_processed["season"])
    df_processed["entity_encoded"] = LabelEncoder().fit_transform(df_processed["Entity"])
    features.extend(["season_encoded", "entity_encoded"])
    return df_processed, features, price_scaler, weather_scaler


def update_dataset_and_preprocess(model, device, seq_length=60, filepath="new_data.csv"):
    """
    Loads data, uses the model to fill missing days up to today, overwrites the
    original file with the updated data, and returns the final processed components.
    """
    print(f"Loading data from '{filepath}'...")
    try:
        original_df = pd.read_csv(filepath, low_memory=False)
    except FileNotFoundError:
        print(f"Error: The file {filepath} was not found.")
        return None
    if original_df.empty:
        print(f"Error: The input file '{filepath}' is empty.")
        return None

    # === Step 1: Basic Cleaning and Date Handling ===
    if 'Unnamed: 0' in original_df.columns:
        original_df = original_df.drop('Unnamed: 0', axis=1)
    
    # Let pandas infer date format, which is more robust.
    original_df["Arrival_Date"] = pd.to_datetime(original_df["Arrival_Date"], errors="coerce")
    original_df.dropna(subset=["Arrival_Date"], inplace=True) # Drop rows where date conversion failed
    original_df.sort_values(by="Arrival_Date", inplace=True)
    
    # === Step 2: Create and Validate the 'Entity' Identifier ===
    # Create the 'Entity' column first.
    original_df['Entity'] = original_df['State'] + " | " + original_df['Market'] + " | " + original_df['Commodity']
    
    # CRITICAL: Drop any rows where the Entity could not be created (due to missing State/Market/Commodity).
    original_df.dropna(subset=['Entity'], inplace=True)
    
    # === Step 3: Fill Missing FEATURE Values (The Correct Way) ===
    # Define columns that should be forward-filled. This avoids touching identifier columns.
    # We drop the original identifier columns plus the composite 'Entity' key and the date.
    cols_to_fill = original_df.columns.drop(['State', 'Market', 'Commodity', 'Entity', 'Arrival_Date'])
    
    # Group by the three specific columns and apply ffill only to the feature columns.
    # This preserves all columns, preventing the KeyError.
    original_df[cols_to_fill] = original_df.groupby(['State', 'Market', 'Commodity'])[cols_to_fill].ffill()
    
    # === Step 4: Final Validation Drop ===
    # Define essential columns needed for the model.
    essential_columns = [
        'State', 'Market', 'Commodity', 'Arrival_Date', 'Modal_Price', 
        'rainfall(mm)', 'max_temperature', 'min_temperature', 
        'humidity(%)', 'flood_index', 'drought_index', 'season'
    ]
    # Drop any remaining rows with missing essential data (e.g., first rows that couldn't be ffilled).
    original_df.dropna(subset=essential_columns, inplace=True)
    
    # --- Final Check ---
    if original_df.empty:
        print(f"Error: DataFrame became empty after cleaning steps. Check CSV for missing values.")
        return None
    
    # === Step 5: Scale data for predictions ===
    scaled_df, features, price_scaler, weather_scaler = _create_features_and_scalers(original_df)
    scaled_df.set_index(pd.to_datetime(original_df['Arrival_Date']), inplace=True)
    entity_groups = {entity: scaled_df[scaled_df["Entity"] == entity] for entity in scaled_df["Entity"].unique()}
    
    # === Step 6: Predict and Generate New Unscaled Rows ===
    today = pd.to_datetime(datetime.today().date())
    all_new_rows = []
    
    entities = original_df["Entity"].unique()
    num_entities = len(entities)
    print(f"Checking for updates for {num_entities} entities until {today.strftime('%Y-%m-%d')}...")

    for i, entity_name in enumerate(entities):
        entity_df_original = original_df[original_df['Entity'] == entity_name]
        if entity_df_original.empty: continue
        last_known_date = entity_df_original["Arrival_Date"].max()
        start_date = last_known_date + timedelta(days=1)
        if start_date > today: continue
        
        print(f"  ({i+1}/{num_entities}) Updating {entity_name}...")
        unscaled_predictions = predict_one_entity(
            model, device, entity_name, entity_groups, features, 
            seq_length, start_date, today, price_scaler, weather_scaler
        )
        if isinstance(unscaled_predictions, str):
            print(f"    -> Skipping: {unscaled_predictions}")
            continue
        
        unscaled_predictions = np.maximum(0, unscaled_predictions)
        
        date_range = pd.date_range(start=start_date, end=today, freq='D')
        last_known_row_data = entity_df_original.iloc[-1]
        for date, price in zip(date_range, unscaled_predictions):
            new_row = last_known_row_data.copy()
            new_row['Arrival_Date'] = date
            new_row['Modal_Price'] = price
            all_new_rows.append(new_row)

    # === Step 7: Combine Data and Overwrite File ===
    if all_new_rows:
        new_data_df = pd.DataFrame(all_new_rows)
        combined_df = pd.concat([original_df, new_data_df], ignore_index=True)
        combined_df.sort_values(by=['Entity', 'Arrival_Date'], inplace=True, ignore_index=True)
        
        print(f"\nAdded {len(new_data_df)} new rows. Overwriting file '{filepath}'...")
        temp_filepath = filepath + '.tmp'
        combined_df.to_csv(temp_filepath, index=False)
        os.replace(temp_filepath, filepath)
        print("File update complete.")
        final_df_to_process = combined_df
    else:
        print("\nDataset is already up-to-date. No changes made.")
        final_df_to_process = original_df

    # === Step 8: Return Final Processed Components for Application Use ===
    final_scaled_df, features, price_scaler, weather_scaler = _create_features_and_scalers(final_df_to_process)
    final_scaled_df.set_index(pd.to_datetime(final_df_to_process['Arrival_Date']), inplace=True)
    final_entities = final_scaled_df["Entity"].unique()
    final_entity_groups = {entity: final_scaled_df[final_scaled_df["Entity"] == entity] for entity in final_entities}

    return final_scaled_df, features, final_entities, final_entity_groups, price_scaler, weather_scaler

def load_and_process_for_api(filepath="new_data.csv"):
    """
    A FAST version of the preprocessor for API startup.
    It ONLY reads and processes the existing file. It does NOT run the slow update loop.
    """
    print(f"API Startup: Loading and processing data from '{filepath}'...")
    try:
        df = pd.read_csv(filepath, low_memory=False)
    except FileNotFoundError:
        print(f"API FATAL ERROR: Data file not found at {filepath}")
        return None
    if df.empty:
        print(f"API FATAL ERROR: Data file at {filepath} is empty.")
        return None
    
    df['Entity'] = df['State'] + " | " + df['Market'] + " | " + df['Commodity']
    scaled_df, features, price_scaler, weather_scaler = _create_features_and_scalers(df)
    scaled_df.set_index(pd.to_datetime(df['Arrival_Date']), inplace=True)
    entities = scaled_df["Entity"].unique()
    entity_groups = {entity: scaled_df[scaled_df["Entity"] == entity] for entity in entities}

    print("API data processing complete.")
    return scaled_df, features, entities, entity_groups, price_scaler, weather_scaler