import torch
import torch.nn as nn

class LSTMWithAttention(nn.Module):
    def __init__(self, input_size, hidden_layer_size, output_size):
        super(LSTMWithAttention, self).__init__()
        self.hidden_layer_size = hidden_layer_size
        self.lstm = nn.LSTM(input_size, hidden_layer_size, num_layers=2, batch_first=True, bidirectional=True)
        self.attention = nn.Linear(hidden_layer_size * 2, 1)  # *2 for bidirectional
        self.fc = nn.Linear(hidden_layer_size * 2, output_size)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)  # Shape: (batch_size, seq_length, hidden_layer_size*2)
        attention_weights = torch.softmax(self.attention(lstm_out), dim=1)  # Shape: (batch_size, seq_length, 1)
        context_vector = torch.sum(attention_weights * lstm_out, dim=1)  # Shape: (batch_size, hidden_layer_size*2)
        out = self.fc(context_vector)  # Shape: (batch_size, output_size)
        return out
