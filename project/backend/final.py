from datetime import date
import sys  
import warnings
import pandas as pd
import torch
from lstm import LSTMWithAttention  
from preprocessing import update_dataset_and_preprocess
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from predictions import predict_one_entity
from preprocessing import load_and_process_for_api
from market_suggest import get_market_suggestions
from fastapi.middleware.cors import CORSMiddleware 


# 2. Make the LSTMWithAttention class available to the unpickler as if it were in __main__
# This is a common workaround if the model was saved from a script
# where the model class was effectively in the __main__ scope.
# We are telling Python: "If you look for LSTMWithAttention in the __main__ module,
# here it is (it's the one we imported from lstm.py)."
if '__main__' in sys.modules:
    setattr(sys.modules['__main__'], 'LSTMWithAttention', LSTMWithAttention)
else:
    # Fallback in case __main__ isn't in sys.modules, though less likely for Uvicorn workers
    import types
    main_module = types.ModuleType('__main__')
    main_module.LSTMWithAttention = LSTMWithAttention
    sys.modules['__main__'] = main_module


# Suppress specific warning related to torch.load
warnings.filterwarnings("ignore", category=FutureWarning, message=".*torch.load.*")

# 3. Now load the model
print("Loading model and preprocessing data...")
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = torch.load('lstm_full_model.pth', map_location=device, weights_only=False) # This should now work
model.eval()

# df, features, entities, entity_groups, price_scaler, weather_scaler = update_dataset_and_preprocess(model, device)
# print("Model and data loaded successfully.")

# results = update_dataset_and_preprocess(model, device, filepath="new_data.csv")
results = load_and_process_for_api(filepath="new_data.csv")

# Check if the function succeeded before unpacking
if results:
    # Unpack the results only if they are not None
    df, features, entities, entity_groups, price_scaler, weather_scaler = results
    
    print("Data successfully loaded and processed. Starting application...")
    # ... continue with your server logic (app.run, etc.) here ...
    
else:
    # If results is None, the function failed. Stop the program.
    print("FATAL: Data preprocessing failed. The application cannot start.")
    
app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Origins that are allowed to make requests
    allow_credentials=True, # Whether to support credentials (cookies, authorization headers)
    allow_methods=["*"],    # Allow all methods (GET, POST, PUT, DELETE, OPTIONS, etc.) or specify like ["GET", "POST"]
    allow_headers=["*"],    # Allow all headers or specify like ["Content-Type", "Authorization"]
)

class PredictionRequest(BaseModel):
    state: str
    market: str
    commodity: str
    start_date : date
    end_date : date
    # num_days: int
    
    
class SuggestionRequest(BaseModel):
    commodity: str
    market: str
    state: str
    radius: int
    start_date : date
    end_date : date
    # num_days: int
    
@app.get("/")
def root():
    return {"message": "CropNex Prediction API is working sucessfully"} 

@app.post("/predict")
def predict_endpoint(request: PredictionRequest): 
    state = request.state
    market = request.market
    commodity = request.commodity
    entity = f"{state} | {market} | {commodity}"
    start_date = request.start_date
    end_date = request.end_date
    num_days = len(pd.date_range(start=start_date, end=end_date, freq='D'))
    print(f"Received prediction request for entity: {entity} for {num_days} days.")
    seq_length = 60  
    try:
        if entity not in entity_groups:
            raise HTTPException(status_code=404, detail=f" No combination of State and Market exists, please check what you have entered and try again ")
        
        result = predict_one_entity(model, device, entity, entity_groups, features, seq_length, start_date, end_date, price_scaler, weather_scaler)
        print(f'Predictions for {entity} are: {result.tolist()}')
        return {"prediction": result.tolist()}
    except ValueError as ve: 
        print(f"ValueError during prediction: {ve}")
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        import traceback
        print(f"Unhandled error during prediction: {e}")
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")
    
# !!!! ---- there is a problem with the state, when we set state for suggestions it is using the same state for all places.
    
@app.post("/suggest")
def market_suggestions(request: SuggestionRequest):
    try:
        commodity = request.commodity
        state = request.state  
        market = request.market
        radius = request.radius
        start_date = request.start_date
        end_date = request.end_date
        seq_length = 60
        entity = f"{state} | {market} | {commodity}"
        num_days = len(pd.date_range(start=start_date, end=end_date, freq='D'))
        print(f"Received market suggestion request for entity: {entity} with radius {radius} km for {num_days} days.")

        if entity not in entity_groups:
            raise HTTPException(status_code=404, detail=f"Entity '{entity}' not found in database.")

        suggestions = get_market_suggestions(
            entity, radius, start_date, end_date, model, device,
            entity_groups, features, seq_length, price_scaler, weather_scaler
        )

        if not suggestions:
            raise HTTPException(status_code=204, detail="No market suggestions could be generated.")

        print(f"Suggestions received are: {suggestions}")
        return {"suggestions": suggestions}

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Value error: {str(ve)}")

    except KeyError as ke:
        raise HTTPException(status_code=400, detail=f"Missing key: {str(ke)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")