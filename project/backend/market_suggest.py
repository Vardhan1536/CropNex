import numpy as np
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import json # For pretty printing output
from predictions import predict_one_entity 

def get_distance(place1, place2):
    geolocator = Nominatim(user_agent="market_suggestion_app_v2") # Use a unique user_agent
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
        print(f"Distance between {place1} and {place2} is {distance_km:.2f} km") # Optional print
        return round(distance_km, 2)
    else:
        missing = [p for p, loc in [(place1, location1), (place2, location2)] if not loc]
        print(f"Warning: Location(s) {', '.join(missing)} could not be geocoded.")
        return -1

def get_market_suggestions(entity_str, radius_km, num_days_predict, model, device, entity_groups, features, seq_length,price_scaler,weather_scaler):
    
    try:
        original_state, original_market, original_commodity = [s.strip() for s in entity_str.split('|')]
    except ValueError:
        print(f"Error: Entity string '{entity_str}' is not in the format 'State | Market | Commodity'.")
        return {}

    # Get predictions for the original entity
    original_price_predictions = predict_one_entity(model, device, entity_str,entity_groups,features,seq_length,num_days_predict,price_scaler,weather_scaler)
    
    if isinstance(original_price_predictions, str):
        print(f"Error predicting for original entity '{entity_str}': {original_price_predictions}")
        return {}
    if not hasattr(original_price_predictions, '__len__') or len(original_price_predictions) == 0:
        print(f"Error: No price predictions returned for original entity '{entity_str}'.")
        return {}
        
    original_avg_price = float(np.float32(np.mean(original_price_predictions)))
    print(f"Average predicted price for '{original_market}' (Commodity: {original_commodity}): {original_avg_price:.2f}")

    areas_to_check_names = ['Kalikiri', 'Mulakalacheruvu', 'Vayalapadu', 'Gudimalkapur', 'Pattikonda', 'Bowenpally', 'L B Nagar']
    
    print(f"\nChecking {len(areas_to_check_names)} pre-defined areas for suggestions...")
    
    candidate_markets = []
    for area_name in areas_to_check_names:
        area_name_stripped = area_name.strip()
        if area_name_stripped == original_market: 
            continue

        distance = get_distance(original_market, area_name_stripped)
        
        if distance != -1 and distance <= radius_km:
            # Construct the entity string for this area.
            # Your original code implies these areas are in "Andhra Pradesh".
            # For more generality, use original_state.
            prospective_entity_str = f"{original_state} | {area_name_stripped} | {original_commodity}"
            
            # Check if this prospective entity exists in our known entity_groups (from model2.py)
            if prospective_entity_str not in entity_groups:
                print(f"  Skipping '{area_name_stripped}': Data for entity '{prospective_entity_str}' not found.")
                continue

            candidate_markets.append({
                'name': area_name_stripped,
                'full_entity': prospective_entity_str,
                'distance': distance
            })
            print(f"  '{area_name_stripped}' is {distance:.2f}km away (within radius). Will check price.")
        elif distance != -1:
            print(f"  '{area_name_stripped}' is {distance:.2f}km away (outside radius).")
            continue

    if not candidate_markets:
        print(f"No alternative markets from the predefined list found within {radius_km}km radius or with available data.")
        return {}

    print(f"\nFound {len(candidate_markets)} potential markets. Fetching price predictions...")

    suggested_options = {}
    # Sort by distance for processing order (optional)
    for cand_market_info in sorted(candidate_markets, key=lambda x: x['distance']):
        cand_entity_str = cand_market_info['full_entity']
        cand_market_name = cand_market_info['name']
        
        print(f"  Predicting for: '{cand_entity_str}' (Distance: {cand_market_info['distance']:.2f}km)")
        
        cand_price_predictions = predict_one_entity(model, device, cand_entity_str,entity_groups,features,seq_length,num_days_predict,price_scaler,weather_scaler)

        if isinstance(cand_price_predictions, str): # Error string
            print(f"    Could not get predictions for '{cand_entity_str}': {cand_price_predictions}")
            continue
        if not hasattr(cand_price_predictions, '__len__') or len(cand_price_predictions) == 0:
            print(f"    Received empty predictions for '{cand_entity_str}'.")
            continue

        cand_avg_price = float(np.float32(np.mean(cand_price_predictions)))
        print(f"    Average predicted price for '{cand_market_name}': {cand_avg_price:.2f}")

        if cand_avg_price > original_avg_price:
            profit_margin = cand_avg_price - original_avg_price
            suggested_options[cand_market_name] = {
                'suggested_average_price': round(cand_avg_price, 2),
                'original_average_price': round(original_avg_price, 2),
                'price_advantage': round(profit_margin, 2),
                'distance_km': cand_market_info['distance']
            }
            print(f"    RECOMMENDATION: '{cand_market_name}' offers a better price (+{profit_margin:.2f}).")
        else:
            print(f"    '{cand_market_name}' avg price ({cand_avg_price:.2f}) is not higher than original market's ({original_avg_price:.2f}).")
            continue

    if not suggested_options:
        print("\nNo markets found from the predefined list within radius with a higher average predicted price.")
        return {}
    
    # Sort final suggestions by price advantage (descending)
    sorted_suggestions = sorted(suggested_options.items(), key=lambda item: item[1]['price_advantage'], reverse=True)
    
    final_suggestions_list = []
    for market_name, details in sorted_suggestions:
        final_suggestions_list.append({
            "market_name": market_name,
            "suggested_average_price": details["suggested_average_price"], 
            "original_average_price": details["original_average_price"],   
            "price_advantage": details["price_advantage"],
            "distance_km": details["distance_km"]
        })

    return final_suggestions_list

