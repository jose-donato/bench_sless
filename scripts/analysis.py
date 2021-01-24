import pandas as pd
import numpy
from os import walk
import json


def get_files(path):
    _, _, filenames = next(walk(path))
    return filenames


def convert(o):
    if isinstance(o, numpy.int64):
        return int(o)
    raise TypeError


if __name__ == "__main__":
    path = "./results"
    frameworks = ["next_sless", "netlify", "express"]
    tests = ["echo", "image"]
    imageSizes = ["640x959", "1920x2878", "2400x3598"]
    files = get_files(path)
    for file in files:
        results = []
        #print("\n\nprocessing file "+file)
        file_path = path + "/" + file
        column_names = [i for i in range(0, 7)]
        df = pd.read_csv(file_path, header=None, names=column_names)
        for application in frameworks:
            #express_rows = df[(df[0] == "express") & (df[1] == "echo")]
            #print("application "+application)
            obj = {
                "application": application,
                "echo": {},
                "image": []
            }
            for test in tests:
                if test == "echo":
                    rows = df[(df[0] == application) & (
                        df[1] == test) & (df[3] == "success")]
                    echoSum = rows[2].astype(float).sum()
                    echoTotal = rows[0].count()
                    if echoTotal != 0:
                        echoMean = echoSum / echoTotal
                    else:
                        echoMean = 0
                    echoResult = {
                        "total": echoTotal,
                        "mean": echoMean,
                    }
                    obj["echo"] = echoResult
                    #print("echo mean: "+str(echoMean))
                elif test == "image":
                    for size in imageSizes:
                        imageRows = df[(df[0] == application) & (df[1] == test) & (
                            df[5] == size) & (df[6] == "success")]
                        imageWholeSum = imageRows[2].astype(float).sum()
                        imageFunctionSum = imageRows[3].astype(float).sum()
                        imageTotal = imageRows[0].count()
                        if imageTotal != 0:
                            imageWholeMean = imageWholeSum / imageTotal
                            imageFunctionMean = imageFunctionSum / imageTotal
                        else:
                            imageWholeMean = 0
                            imageFunctionMean = 0
                        imageResult = {
                            "size": size,
                            "total": imageTotal,
                            "mean": imageFunctionMean,
                            "meanWhole": imageWholeMean
                        }
                        obj["image"].append(imageResult)
                        #print("image "+size)
                        #print("whole mean: "+str(imageWholeMean))
                        #print("function mean: "+str(imageFunctionMean))
                # results[application][test]
            results.append(obj)
        pathJson = "./results_json/"
        jsonFilePath = pathJson + file.split(".")[0]+".json"
        with open(jsonFilePath, 'w') as outfile:
            json.dump(results, outfile, default=convert)
    print("all outputs saved in folder: "+pathJson)
    # print(results)
