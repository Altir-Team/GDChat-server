import ws, asyncdispatch, asynchttpserver, strutils, sequtils, ospaths

type Client = ref object
  ws: WebSocket
  nick: string

var connections = newSeq[Client]()

proc processCommand(client: Client, arguments: seq[string]): Future[void] {.async.} =
    var args = arguments
    let command: string = args[0]
    args.delete(0, 0)
    case command
        of "help":
            asyncCheck client.ws.send("nick <nickname> - change nickname\nclear - clears chat history")
        of "nick":
            if len(args) == 0:
                asyncCheck client.ws.send("{de1b1b}No nickname provided{}")
                discard
            else:
                client.nick = args[0]
                asyncCheck client.ws.send("{27c91e}Nickname successfully updated!{}")
        of "clear":
            asyncCheck client.ws.send("clearClient")
        else:
            asyncCheck client.ws.send("{de1b1b}Unknown command. Use {000000}/help{de1b1b} to view list of commands")
    return

proc sendToAll(message: string, ignore: Client = nil): Future[void] {.async, gcsafe.} =
    for other in sequtils.filter(connections, proc (cl: Client): bool =
        if isNil(ignore): cl == cl
        else: cl != ignore
    ):
        if other.ws.readyState == Open:
            asyncCheck other.ws.send(message)
    return

proc cb(req: Request) {.async, gcsafe.} =
    if req.url.path == "/chat":
        try:
            echo "new connection"
            var ws = await newWebSocket(req)
            var client = Client(ws: ws, nick: "Anon")
            connections.add client
            await ws.send("{9370DB}Welcome to GDChat!\nYou can use a bot here. Get commands: /help{}")
            await sendToAll("online::" & $len(connections))
            while ws.readyState == Open:
                var packet = await ws.receiveStrPacket()
                if strutils.startsWith(packet, '/'):
                    strutils.delete(packet, 0, 0)
                    var args = strutils.split(packet, ' ')
                    await processCommand(client, args)
                    continue
                elif len(packet) != 0:
                    await sendToAll("{28afe0}" & client.nick & "{}: " & packet)
        except:
            await sendToAll("online::" & $len(connections))
    await req.respond(Http200, "trololololo")

    
var server = newAsyncHttpServer()
waitFor server.serve(Port(strutils.parseInt(getEnv("PORT", "3000"))), cb)