from lib.files import dir_exists
from lib.inquirer_questions import configurations
from lib.bench import run
import sys
from multiprocessing import Pool

if __name__ == "__main__":
    print("BENCH_SLESS")
    if(not dir_exists("assets")):
        print("Provide assets folder with images")
        sys.exit()
    config = configurations()
    run(int(config.get("duration")), int(config.get("parallelism")),
        config.get("endpoints"), config.get("images"))
    # pool = Pool(processes=int(config.get("parallelism"))
