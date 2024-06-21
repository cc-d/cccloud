import os
import os.path as op
from pyshared import typed_evar as evar

# Configuration file for future extensibility
BASE_DIR = evar('CCC_DIR', op.dirname(op.dirname(op.abspath(__file__))))

UPLOAD_DIR = evar('CCC_UPLOAD_DIR', op.join(BASE_DIR, 'uploads'))

if not op.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


CHUNK_SIZE = 1024 * 1024

EXT = '.enc'

BASE_URL = evar('CCC_HOST', 'http://localhost:8000')


SAFE_CHARS = (
    '0123456789'
    + 'abcdefghijklmnopqrstuvwxyz'
    + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    + '!#$%&()+,-:;<=>?@[]^_`{|} .'
)
