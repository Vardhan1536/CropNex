import numpy as np
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import json
from predictions import predict_one_entity 

# This part is fine and doesn't need changes
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
    # This function is also fine
    geolocator = Nominatim(user_agent="market_suggestion_app_v4")
    try:
        location1 = geolocator.geocode(place1, timeout=10)
        location2 = geolocator.geocode(place2, timeout=10)
    except Exception as e:
        print(f"Warning: Geocoding error for '{place1}' or '{place2}': {e}")
        return -1

    if location1 and location2:
        coords_1 = (location1.latitude, location1.longitude)
        coords_2 = (location2.latitude, location2.longitude)
        return round(geodesic(coords_1, coords_2).kilometers, 2)
    else:
        missing = [p for p, loc in [(place1, location1), (place2, location2)] if not loc]
        print(f"Warning: Location(s) {', '.join(missing)} could not be geocoded.")
        return -1

# --- REFACTORED FUNCTION ---
def get_market_suggestions(entity_str, radius_km, start_date, end_date, model, device, entity_groups, features, seq_length, price_scaler, weather_scaler):
    
    try:
        original_state, original_market, original_commodity = [s.strip() for s in entity_str.split('|')]
    except ValueError:
        # This is an internal error, but good to handle.
        return f"Internal Error: Entity string '{entity_str}' is not in the correct format."

    # --- FIX 1: Handle errors from the original prediction ---
    # Get predictions for the original entity first
    original_price_predictions = predict_one_entity(
        model, device, entity_str, entity_groups, features, seq_length, 
        start_date, end_date, price_scaler, weather_scaler
    )
    
    # If predict_one_entity returns an error string (e.g., for a future date), pass it up.
    if isinstance(original_price_predictions, str):
        print(f"Error predicting for original entity '{entity_str}': {original_price_predictions}")
        # Return the exact error message from the prediction function
        return original_price_predictions
    
    if not hasattr(original_price_predictions, '__len__') or len(original_price_predictions) == 0:
        return f"Could not generate price predictions for your selected market '{original_market}'."
        
    original_avg_price = float(np.mean(original_price_predictions))
    print(f"Average predicted price for '{original_market}' ({original_commodity}): {original_avg_price:.2f}")

    print(f"\nFinding candidate markets within {radius_km}km radius...")
    
    candidate_markets = []
    for market_info in POTENTIAL_MARKET_LOCATIONS:
        area_name, area_state = market_info['name'], market_info['state']
        if area_name == original_market: 
            continue

        prospective_entity_str = f"{area_state} | {area_name} | {original_commodity}"
        if prospective_entity_str not in entity_groups:
            continue

        distance = get_distance(original_market, area_name)
        if distance != -1 and distance <= radius_km:
            candidate_markets.append({
                'name': area_name,
                'full_entity': prospective_entity_str,
                'distance': distance
            })
            print(f"  -> Found candidate: '{area_name}' ({distance:.2f}km away)")
    
    # --- FIX 2: Handle case where no markets are found in the radius ---
    if not candidate_markets:
        print(f"No alternative markets found within {radius_km}km.")
        return f"No other markets trading '{original_commodity}' were found within a {radius_km}km radius."

    print(f"\nFound {len(candidate_markets)} potential markets. Comparing price predictions...")

    suggested_options = {}
    for cand_market_info in sorted(candidate_markets, key=lambda x: x['distance']):
        cand_entity_str, cand_market_name = cand_market_info['full_entity'], cand_market_info['name']
        print(f"  Checking price for: '{cand_entity_str}'")
        
        cand_price_predictions = predict_one_entity(
            model, device, cand_entity_str, entity_groups, features, seq_length, 
            start_date, end_date, price_scaler, weather_scaler
        )

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

    # --- FIX 3: Handle case where no markets have better prices ---
    if not suggested_options:
        print("\nNo markets found with a higher average predicted price.")
        return (f"Your selected market, '{original_market}', has the highest predicted price for "
                f"'{original_commodity}' compared to other markets in the selected radius.")

    # If we get here, we have successful suggestions.
    sorted_suggestions = sorted(suggested_options.items(), key=lambda item: item[1]['price_advantage'], reverse=True)
    
    final_suggestions_list = [
        {"market_name": market_name, **details} for market_name, details in sorted_suggestions
    ]

    return final_suggestions_list