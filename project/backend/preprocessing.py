import pandas as pd
from sklearn.preprocessing import LabelEncoder, MinMaxScaler


def preprocess_data():
    # Load data
    df = pd.read_csv("Ffinal_merged_6.csv", low_memory=False)

    # Convert date column to datetime and sort data
    df["Arrival_Date"] = pd.to_datetime(
        df["Arrival_Date"], format="%d-%m-%Y", errors="coerce"
    )
    df = df.sort_values(by="Arrival_Date")

    # Fill missing values
    df = df.ffill()

    # Feature scaling
    price_scaler = MinMaxScaler(feature_range=(0, 1))
    df["Modal_Price"] = price_scaler.fit_transform(
        df["Modal_Price"].values.reshape(-1, 1)
    )

    weather_scaler = MinMaxScaler(feature_range=(0, 1))
    weather_features = ["rainfall(mm)", "max_temperature", "min_temperature"]
    df[weather_features] = weather_scaler.fit_transform(df[weather_features])

    # Sequence length for LSTM
    # seq_length = 60

    df["Entity"] = df["State"] + " | " + df["Market"] + " | " + df["Commodity"]

    # Dynamic features selection
    features = [
        "Modal_Price",
        "rainfall(mm)",
        "max_temperature",
        "min_temperature",
        "humidity(%)",
        "flood_index",
        "drought_index",
    ]

    # Label encode the 'season' column
    label_encoder = LabelEncoder()
    df["season_encoded"] = label_encoder.fit_transform(df["season"])
    df["entity_encoded"] = LabelEncoder().fit_transform(df["Entity"])
    
    # Add the encoded 'season' column to features
    features.append("season_encoded")
    features.append("entity_encoded")

    entities = df["Entity"].unique()
    entity_groups = {entity: df[df["Entity"] == entity] for entity in entities}
    df.drop('Unnamed: 0',axis=1,inplace=True)
    
    return df,features,entities,entity_groups,price_scaler,weather_scaler
