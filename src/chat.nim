import ws, asyncdispatch, asynchttpserver, strutils, os, chatutils, sequtils

var connections = newSeq[Client]()

proc cb(req: Request) {.async,gcsafe.} =
    if req.url.path == "/":
        try:
            var ws = await newWebSocket(req)
            var client = Client(ws: ws, nick: "Anon")
            connections.add client
            await ws.send("{9370DB}Welcome to GDChat!\nYou can use a bot here. Get commands: /help{}")
            await sendToAll(connections, "online::" & $len(connections))
            while ws.readyState == Open:
                var packet = await ws.receiveStrPacket()
                if strutils.startsWith(packet, '/'):
                    strutils.delete(packet, 0, 0)
                    var args = strutils.split(packet, ' ')
                    await processCommand(client, args)
                    continue
                elif len(packet) != 0:
                    var content = procChatContent(packet)
                    if len(content) != 0:
                      await sendToAll(connections, "{28afe0}" & client.nick & "{}: " & content)
        except:
            connections = connections.filter(proc (client: Client): bool =
                client.ws.tcpSocket != req.client)
            await sendToAll(connections, "online::" & $len(connections))

    
var server = newAsyncHttpServer()
waitFor server.serve(Port(strutils.parseInt(getEnv("PORT", "3000"))), cb)