import os
import os.path as op
from pyshared import typed_evar as evar

# Configuration file for future extensibility
if 'CCC_UPLOAD_DIR' in os.environ:
    UPLOAD_DIR = evar('CCC_UPLOAD_DIR')
    BASE_DIR = op.dirname(UPLOAD_DIR)
else:
    BASE_DIR = op.dirname(op.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR = op.join(BASE_DIR, "uploads")

if not op.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


CHUNK_SIZE = 1024 * 1024

EXT = '.enc'
