import torch
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import torch.nn as nn

class NN(nn.Module):
    def __init__(self, neurons, num_classes):
        super(NN, self).__init__()

        self.neurons = neurons

        for i in range(len(neurons)):
            if i == len(neurons) - 1:
                setattr(self, f'fc{i+1}', nn.Linear(neurons[i], num_classes))
            else:
                setattr(self, f'fc{i+1}', nn.Linear(neurons[i], neurons[i+1]))

    def forward(self, x):

        for i in range(len(self.neurons)):
            if i == len(self.neurons) - 1:
                x = getattr(self, f'fc{i+1}')(x)
            else:
                x = torch.tanh(getattr(self, f'fc{i+1}')(x))

        return x

model = NN([9, 300, 300], num_classes=9)
model.load_state_dict(torch.load('ttt_final_model.pth'))
model.eval()

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/move', methods=['POST'])
def get_ai_move():
    data = request.get_json()
    board = [data.get('board')]

    board_tensor = torch.tensor(board, dtype=torch.float32)

    with torch.no_grad():
        output = model(board_tensor)
        _, prediction = torch.max(output, 1)
        move = int(prediction.item())

    return jsonify({'move': move})

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)