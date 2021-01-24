endpoints = {
    "next_sless": {
        "url": "http://SERVER_IP_RUNNING_APPLICATIONS:3001/api/dominantColor",
        "echo": "http://SERVER_IP_RUNNING_APPLICATIONS:3001/api/echo"
    },
    "netlify": {
        "url": "http://SERVER_IP_RUNNING_APPLICATIONS:8888/.netlify/functions/dominantColor",
        "echo": "http://SERVER_IP_RUNNING_APPLICATIONS:8888/.netlify/functions/echo"
    },
    "express": {
        "url": "http://SERVER_IP_RUNNING_APPLICATIONS:3003/api/dominantColor",
        "echo": "http://SERVER_IP_RUNNING_APPLICATIONS:3003/echo"
    }
}
