import numpy as np
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import json # For pretty printing output
from predictions import predict_one_entity 

# --- FIX 1: Create a structured list of potential markets with their correct states ---
# This is much more robust than a simple list of names.
# Define it outside the function so it's a reusable constant.
POTENTIAL_MARKET_LOCATIONS = [
    {'name': 'Kalikiri', 'state': 'Andhra Pradesh'},
    {'name': 'Mulakalacheruvu', 'state': 'Andhra Pradesh'},
    {'name': 'Vayalapadu', 'state': 'Andhra Pradesh'},
    {'name': 'Pattikonda', 'state': 'Andhra Pradesh'},
    {'name': 'Gudimalkapur', 'state': 'Telangana'},
    {'name': 'Bowenpally', 'state': 'Telangana'},
    {'name': 'L B Nagar', 'state': 'Telangana'},
]

def get_distance(place1, place2):
    # This helper function is correct and needs no changes.
    geolocator = Nominatim(user_agent="market_suggestion_app_v3") # Use a unique user_agent
    try:
        location1 = geolocator.geocode(place1, timeout=10)
        location2 = geolocator.geocode(place2, timeout=10)
    except Exception as e:
        print(f"Warning: Geocoding error for '{place1}' or '{place2}': {e}")
        return -1

    if location1 and location2:
        coords_1 = (location1.latitude, location1.longitude)
        coords_2 = (location2.latitude, location2.longitude)
        distance_km = geodesic(coords_1, coords_2).kilometers
        # Optional print:
        # print(f"Distance between {place1} and {place2} is {distance_km:.2f} km") 
        return round(distance_km, 2)
    else:
        missing = [p for p, loc in [(place1, location1), (place2, location2)] if not loc]
        print(f"Warning: Location(s) {', '.join(missing)} could not be geocoded.")
        return -1

def get_market_suggestions(entity_str, radius_km, start_date, end_date, model, device, entity_groups, features, seq_length, price_scaler, weather_scaler):
    
    try:
        original_state, original_market, original_commodity = [s.strip() for s in entity_str.split('|')]
    except ValueError:
        print(f"Error: Entity string '{entity_str}' is not in the format 'State | Market | Commodity'.")
        return {}

    # Get predictions for the original entity first
    original_price_predictions = predict_one_entity(model, device, entity_str, entity_groups, features, seq_length, start_date, end_date, price_scaler, weather_scaler)
    
    if isinstance(original_price_predictions, str):
        print(f"Error predicting for original entity '{entity_str}': {original_price_predictions}")
        return {}
    if not hasattr(original_price_predictions, '__len__') or len(original_price_predictions) == 0:
        print(f"Error: No price predictions returned for original entity '{entity_str}'.")
        return {}
        
    original_avg_price = float(np.mean(original_price_predictions))
    print(f"Average predicted price for '{original_market}' ({original_commodity}): {original_avg_price:.2f}")

    print(f"\nFinding candidate markets within {radius_km}km radius...")
    
    candidate_markets = []
    # --- FIX 2: Iterate through the new structured list ---
    for market_info in POTENTIAL_MARKET_LOCATIONS:
        area_name = market_info['name']
        area_state = market_info['state']

        if area_name == original_market: 
            continue

        # --- FIX 3: Construct the CORRECT entity string using the correct state ---
        prospective_entity_str = f"{area_state} | {area_name} | {original_commodity}"
        
        # --- OPTIMIZATION: Check if we even have data for this market BEFORE getting the distance ---
        if prospective_entity_str not in entity_groups:
            # This is a silent skip, as it's expected that not all markets trade all commodities.
            # print(f"  Skipping '{area_name}': Data for entity '{prospective_entity_str}' not found.")
            continue

        # Now that we know data exists, get the distance (slow API call)
        distance = get_distance(original_market, area_name)
        
        if distance != -1 and distance <= radius_km:
            candidate_markets.append({
                'name': area_name,
                'full_entity': prospective_entity_str,
                'distance': distance
            })
            print(f"  -> Found candidate: '{area_name}' ({distance:.2f}km away)")
    
    if not candidate_markets:
        print(f"No alternative markets from the predefined list found within {radius_km}km radius or with available data.")
        return [] # Return an empty list for consistency

    print(f"\nFound {len(candidate_markets)} potential markets. Fetching and comparing price predictions...")

    suggested_options = {}
    for cand_market_info in sorted(candidate_markets, key=lambda x: x['distance']):
        cand_entity_str = cand_market_info['full_entity']
        cand_market_name = cand_market_info['name']
        
        print(f"  Checking price for: '{cand_entity_str}'")
        
        cand_price_predictions = predict_one_entity(model, device, cand_entity_str, entity_groups, features, seq_length, start_date, end_date, price_scaler, weather_scaler)

        if isinstance(cand_price_predictions, str) or not hasattr(cand_price_predictions, '__len__') or len(cand_price_predictions) == 0:
            print(f"    -> Skipping '{cand_market_name}': Could not get valid predictions.")
            continue

        cand_avg_price = float(np.mean(cand_price_predictions))
        
        if cand_avg_price > original_avg_price:
            profit_margin = cand_avg_price - original_avg_price
            suggested_options[cand_market_name] = {
                'suggested_average_price': round(cand_avg_price, 2),
                'original_average_price': round(original_avg_price, 2),
                'price_advantage': round(profit_margin, 2),
                'distance_km': cand_market_info['distance']
            }
            print(f"    -> RECOMMENDATION: '{cand_market_name}' offers a better price (+{profit_margin:.2f})")
        else:
            print(f"    -> Skipping '{cand_market_name}': Avg price ({cand_avg_price:.2f}) is not higher.")

    if not suggested_options:
        print("\nNo markets found with a higher average predicted price.")
        return [] # Return an empty list

    # Sort final suggestions by the highest price advantage
    sorted_suggestions = sorted(suggested_options.items(), key=lambda item: item[1]['price_advantage'], reverse=True)
    
    final_suggestions_list = [
        {"market_name": market_name, **details} for market_name, details in sorted_suggestions
    ]

    return final_suggestions_list