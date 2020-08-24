# Package

version       = "1.0.0"
author        = "bit0r1n"
description   = "Web server for GDChat"
license       = "MIT"
srcDir        = "src"
bin           = @["chat"]


# Dependencies

requires "nim >= 0.19.4", "ws >= 0.4.3"
