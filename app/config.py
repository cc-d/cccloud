import os
import os.path as op

# Configuration file for future extensibility
BASE_DIR = op.dirname(op.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = op.join(BASE_DIR, "uploads")

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
