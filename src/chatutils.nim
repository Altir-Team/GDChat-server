import re, sequtils, strutils, ws, asyncdispatch

type Client* = ref object
  ws*: WebSocket
  nick*: string

proc tagsRemove(str: string): string = 
    str.replace(re"[{}]")

proc procChatContent*(str: string): string =
    tagsRemove(str).replace(re"[^a-zA-Z0-9\/\.\-_ ,]")

proc sendToAll*(connections: seq[Client], message: string, ignore: Client = nil): Future[void] {.async,gcsafe.} =
    for other in sequtils.filter(connections, proc (cl: Client): bool =
        if isNil(ignore): cl == cl
        else: cl != ignore
    ):
        if other.ws.readyState == Open:
            asyncCheck other.ws.send(message)
    return

proc processCommand*(client: Client, arguments: seq[string]): Future[void] {.async.} =
    var args = arguments
    let command: string = args[0]
    args.delete(0, 0)
    case command
        of "help":
            asyncCheck client.ws.send("nick <nickname> - changes nickname\nclear - clears chat history")
        of "nick":
            if len(args) == 0:
                asyncCheck client.ws.send("{de1b1b}No nickname providen{}")
                discard
            elif len(tagsRemove(args[0])) == 0:
                asyncCheck client.ws.send("{de1b1b}Invalid nickname providen{}")
                discard
            else:
                client.nick = tagsRemove(args[0])
                asyncCheck client.ws.send("{27c91e}Nickname successfully updated!{}")
        of "clear":
            asyncCheck client.ws.send("clearClient")
        else:
            asyncCheck client.ws.send("{de1b1b}Unknown command. Use {000000}/help{de1b1b} to view list of commands{}")
    return