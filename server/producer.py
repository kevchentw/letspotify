import asyncio
from aioredis import create_connection, Channel, create_redis
import websockets

async def sub_server(websocket, path):
    sub = await create_redis(
            ('localhost', 6379))
    res = await sub.subscribe(path)
    channel = res[0]
    try:
        while True:
            message = await channel.get()
            await websocket.send(message.decode('utf-8'))

    except websockets.exceptions.ConnectionClosed:
        await conn.unsubscribe(channel)
        sub.close()

async def pub_server(websocket, path):
    try:
        while True:
            message = await websocket.recv()
            pub = await create_redis(('localhost', 6379))
            res = await pub.publish(path, message)
            await asyncio.sleep(1)

    except websockets.exceptions.ConnectionClosed:
        print('Connection Closed!')

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.set_debug(True)
    ws_sub = websockets.serve(sub_server, '0.0.0.0', 8767)
    ws_pub = websockets.serve(pub_server, '0.0.0.0', 8765)
    loop.run_until_complete(ws_sub)
    loop.run_until_complete(ws_pub)
    loop.run_forever()
