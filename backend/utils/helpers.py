
from config import config

def allowed_file(filename):
    """
    Check if the file has an allowed extension.
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in config.ALLOWED_EXTENSIONS
