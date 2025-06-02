import sys  # Import the sys module
import warnings
import torch
from lstm import LSTMWithAttention  
from preprocessing import preprocess_data
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from predictions import predict_one_entity
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

df, features, entities, entity_groups, price_scaler, weather_scaler = preprocess_data()
print("Model and data loaded successfully.")

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
    num_days: int
    
class SuggestionRequest(BaseModel):
    commodity: str
    market: str
    state: str
    radius: int
    num_days: int
    
@app.get("/")
def root():
    return {"message": "CropNex Prediction API is working sucessfully"} 

@app.post("/predict")
def predict_endpoint(request: PredictionRequest): # Renamed to avoid potential conflict if you also have a 'predict' function
    state = request.state
    market = request.market
    commodity = request.commodity
    entity = f"{state} | {market} | {commodity}"
    num_days = request.num_days
    print(f"Received prediction request for entity: {entity} for {num_days} days.")
    seq_length = 60  # Assuming this is a fixed parameter
    try:
        result = predict_one_entity(model, device, entity, entity_groups, features, seq_length, num_days, price_scaler, weather_scaler)
        print(f'Predictions for {entity} are: {result.tolist()}')
        return {"prediction": result.tolist()}
    except ValueError as ve: # More specific error handling
        print(f"ValueError during prediction: {ve}")
        raise HTTPException(status_code=404, detail=str(ve)) # e.g. 404 if entity not found
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
        num_days = request.num_days
        seq_length = 60
        entity = f"{state} | {market} | {commodity}"
        print(f"Received market suggestion request for entity: {entity} with radius {radius} km for {num_days} days.")

        if entity not in entity_groups:
            raise HTTPException(status_code=404, detail=f"Entity '{entity}' not found in database.")

        suggestions = get_market_suggestions(
            entity, radius, num_days, model, device,
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