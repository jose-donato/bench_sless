exports.handler = async event => {
    return {
        'statusCode': 200,
        'headers': {
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/html',
        },
        'body': 'Hello world'
    }
}