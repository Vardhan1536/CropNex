import torch
import sys
from lstm import LSTMWithAttention  
from preprocessing import update_dataset_and_preprocess

# --- This setup code is needed to load the model ---
if '__main__' in sys.modules:
    setattr(sys.modules['__main__'], 'LSTMWithAttention', LSTMWithAttention)
else:
    import types
    main_module = types.ModuleType('__main__')
    main_module.LSTMWithAttention = LSTMWithAttention
    sys.modules['__main__'] = main_module
# --- End of setup code ---

def run_update():
    """
    This function performs the slow update process.
    It loads the model, runs predictions to fill missing days,
    and overwrites the data file.
    """
    print("Starting daily data update process...")
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    print("Loading model...")
    model = torch.load('lstm_full_model.pth', map_location=device, weights_only=False)
    model.eval()

    print("Running update and preprocess function. This may take a while...")
    # This is the slow function that runs all the predictions
    results = update_dataset_and_preprocess(model, device, filepath="new_data.csv")

    if results:
        print("Data update process completed successfully.")
    else:
        print("Data update process failed.")

if __name__ == "__main__":
    run_update()