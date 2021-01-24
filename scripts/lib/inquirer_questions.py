from lib.content import endpoints
from lib.files import get_images
import multiprocessing
import inquirer
def configurations():
    endpointsChoices = list(endpoints.keys())
    imagesChoices = get_images("assets")
    return inquirer.prompt([
        inquirer.Text('duration', message="Enter the duration in minutes between 1 and 100min"),
        inquirer.Text("parallelism", message="Parallelism value (between 1 and {})".format(multiprocessing.cpu_count())),
        inquirer.Checkbox("endpoints", message="Select the endpoints", choices=endpointsChoices),
        inquirer.Checkbox("images", message="Select the images", choices=imagesChoices)
    ])

