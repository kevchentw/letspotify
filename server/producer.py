import asyncio
from aioredis import create_connection, Channel, create_redis
import websockets
from ssl import SSLContext

async def sub_server(websocket, path):
    print('sub', websocket)
    sub = await create_redis(
            ('localhost', 6379), password="j6ck4xjp6")
    res = await sub.subscribe(path)
    channel = res[0]
    try:
        while True:
            message = await channel.get()
            print('sub', message)
            await websocket.send(message.decode('utf-8'))

    except websockets.exceptions.ConnectionClosed:
        await sub.unsubscribe(channel)
        sub.close()

async def pub_server(websocket, path):
    print('pub', websocket)
    try:
        while True:
            message = await websocket.recv()
            print('pub', message)
            pub = await create_redis(('localhost', 6379), password="j6ck4xjp6")
            res = await pub.publish(path, message)
            await asyncio.sleep(1)

    except websockets.exceptions.ConnectionClosed:
        print('Connection Closed!')

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.set_debug(True)
    ssl = SSLContext()
    ssl.load_cert_chain(
        '/etc/letsencrypt/live/letspotify.nctu.me/fullchain.pem',
        '/etc/letsencrypt/live/letspotify.nctu.me/privkey.pem',
    )
    ws_sub = websockets.serve(sub_server, '0.0.0.0', 8767, ssl=ssl)
    ws_pub = websockets.serve(pub_server, '0.0.0.0', 8765, ssl=ssl)
    loop.run_until_complete(ws_sub)
    loop.run_until_complete(ws_pub)
    loop.run_forever()
