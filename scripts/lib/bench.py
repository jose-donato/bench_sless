from time import perf_counter
from lib.content import endpoints
from multiprocessing import Process, Manager
from datetime import datetime, timedelta
import base64
import os
import requests
# perf_counter*1000 to get equivalent to performance.now()


def run_task(endpoint, image, arr, i):
    endpointUrl = endpoints.get(endpoint).get("url")
    start = perf_counter()
    try:
        if "express" in endpoint or "netlify" in endpoint:
            res = requests.post(endpointUrl, json={
                                "content": image.get("content")})
        else:
            res = requests.post(endpointUrl, data=image.get("content"))
        end = perf_counter()
        commas = res.text.count(",")
        semicolons = res.text.count(";")
        if commas == 2 and semicolons == 3:  # successful, we can split
            splitted = res.text.split(";")
            #rgb = splitted[0]
            functionDuration = splitted[1]
            #imageType1 = splitted[2]
            #imageDimensions1 = splitted[3]
            string = "{},image,{},{},{},{},success\n".format(
                endpoint, (end-start)*1000, functionDuration, image.get("type"), image.get("dimensions"))
            arr[i] = string
        else:
            string = "{},image,{},-,{},{},failure\n".format(
                endpoint, (end-start)*1000, image.get("type"), image.get("dimensions"))
            arr[i] = string
    except:
        end = perf_counter()
        string = "{},image,{},-,{},{},failure\n".format(
                endpoint, (end-start)*1000, image.get("type"), image.get("dimensions"))
        arr[i] = string

def run_task_echo(endpoint, arr, i):
    endpointUrl = endpoints.get(endpoint).get("echo")
    start = perf_counter()
    res = requests.get(endpointUrl)
    end = perf_counter()
    if res.text == 'Hello world':
        string = "{},echo,{},success\n".format(
            endpoint, (end-start)*1000)
        arr[i] = string
    else:
        string = "{},echo,{},failure\n".format(
            endpoint, (end-start)*1000)
        arr[i] = string


def run(duration, parallelism, endpointsKeys, images):
    benchImages = []
    print("Loading images...")
    for image in images:
        with open("assets/"+image, "rb") as image_file:
            #size = os.path.getsize("assets/"+image)
            # "fileSizeInBytes": size,
            if "jpg" in image:
                imageType = "jpeg"
            else:
                imageType = "png"
            imagePrefix = "data:image/{};base64,".format(imageType)
            data = imagePrefix + \
                base64.b64encode(image_file.read()).decode('utf-8')
            benchImages.append({
                "path": image,
                "content": data,
                "type": imageType,
                "dimensions": image.split(".")[0]
            })
    print("Images loaded")
    now = datetime.now()
    total_duration = duration*len(endpointsKeys)*len(images) + duration*len(endpointsKeys)/3
    estimated = now + timedelta(minutes=total_duration)
    print("Benchmark expected to end at " + estimated.strftime("%Y%m%dT%H%M%S"))
    output_file = "results/" + now.strftime(
        "%Y%m%dT%H%M%S") + "__{}_{}.csv".format(duration, parallelism)
    print("Output file: " + output_file)
    results = {}
    times = {}
    for endpoint in endpointsKeys:
        results[endpoint] = []
        times[endpoint] = {
            "startEndpoint": "",
            "startEndpointEcho": "",
            "startEndpointImages": "",
            "finishEndpoint": "",
            "finishEndpointEcho": "",
            "finishEndpointImages": "",
        }
        times[endpoint]["startEndpoint"] = datetime.now().strftime("%Y%m%dT%H%M%S")
        print("Starting endpoint {} at {}".format(endpoint, str(times[endpoint]["startEndpoint"])))
        print("\tGrabbing mean latency with echo...")
        startEndpointEcho = perf_counter()
        times[endpoint]["startEndpointEcho"] = datetime.now().strftime("%Y%m%dT%H%M%S")
        while((perf_counter()-startEndpointEcho) < ((duration * 60)/3)):
            #print("\t\tStill missing {} seconds to finish echo".format(str(((duration*60)/3)-(perf_counter()-startEndpointEcho))), end='\r')
            with Manager() as manager:
                jobs = []
                arrEcho = manager.list(range(parallelism))
                for i in range(parallelism):
                    p = Process(target=run_task_echo, args=(
                        endpoint, arrEcho, i))
                    jobs.append(p)
                    p.start()
                    for proc in jobs:
                        proc.join()
                    results[endpoint] += arrEcho
        times[endpoint]["finishEndpointEcho"] = datetime.now().strftime("%Y%m%dT%H%M%S")
        print("\tEcho done at {}".format(str(times[endpoint]["finishEndpointEcho"])))
        print("\tSending images...")
        times[endpoint]["startEndpointImages"] = datetime.now().strftime("%Y%m%dT%H%M%S")
        for image in benchImages:
            startEndpoint = perf_counter()
            #times[endpoint][image.get("path")].start = datetime.now().strftime("%Y%m%dT%H%M%S")
            print("\t\tSending image {}...".format(image.get("path")))
            if endpoint == "workers_sless":
                if image.get("path") == "640x959.jpg":
                    while((perf_counter()-startEndpoint) < duration * 60):
                        #print("\t\tStill missing {} seconds to finish image {}".format(str((duration*60)-(perf_counter()-startEndpoint)), image.get("path")), end='\r')
                        with Manager() as manager:
                            jobs = []
                            arr = manager.list(range(parallelism))
                            for i in range(parallelism):
                                p = Process(target=run_task, args=(
                                    endpoint, image, arr, i))
                                jobs.append(p)
                                p.start()
                                for proc in jobs:
                                    proc.join()
                                results[endpoint] += arr
            else:
                while((perf_counter()-startEndpoint) < duration * 60):
                    #print("\t\tStill missing {} seconds to finish image {}".format(str((duration*60)-(perf_counter()-startEndpoint)), image.get("path")), end='\r')
                    with Manager() as manager:
                        jobs = []
                        arr = manager.list(range(parallelism))
                        for i in range(parallelism):
                            p = Process(target=run_task, args=(
                                endpoint, image, arr, i))
                            jobs.append(p)
                            p.start()
                            for proc in jobs:
                                proc.join()
                            results[endpoint] += arr
            #times[endpoint][image.get("path")].finish = datetime.now().strftime("%Y%m%dT%H%M%S")
            #times[endpoint][image.get("path")].duration = perf_counter() - startEndpoint
        times[endpoint]["finishEndpointImages"] = datetime.now().strftime("%Y%m%dT%H%M%S")
        times[endpoint]["finishEndpoint"] = datetime.now().strftime("%Y%m%dT%H%M%S")
        print("Endpoint finished at ".format(endpoint, str(times[endpoint]["finishEndpoint"])))
    print("Benchmark done")
    print(times)
    print("Saving output...")
    printable_string = "scenario,m2,m1,image type,image dimensions,outcome\n"
    for key, value in results.items():
        if type(value) is list:
            if len(value) > 0:
                for v in value:
                    if type(v) is str:
                        printable_string += v
    with open(output_file, 'w+') as fd:
        fd.write(printable_string)
        fd.close()
    print("Output saved!")
