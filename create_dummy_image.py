from PIL import Image
import numpy as np

# Create a green image (simulating a leaf)
img = Image.new('RGB', (640, 640), color = (34, 139, 34))
img.save('test_crop.jpg')
print("Created dummy test_crop.jpg")
