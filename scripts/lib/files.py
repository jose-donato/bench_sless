import os
import glob

def dir_exists(path):
    return os.path.isdir(path)

def get_images(path):
    return os.listdir(path)