radio.onReceivedValue(function (name, value) {
    if (name == "LOG") {
        stamp = "" + timeanddate.date(timeanddate.DateFormat.YYYY_MM_DD) + " " + timeanddate.time(timeanddate.TimeFormat.HHMMSS24hr)
        datalogger.log(
        datalogger.createCV("timestamp", stamp),
        datalogger.createCV("distance", value)
        )
        serial.writeLine("" + stamp + "," + ("" + value))
    } else if (name == "DIST") {
        serial.writeLine("DIST " + ("" + value))
    } else if (name == "ACK") {
        serial.writeLine("OK THRESHOLD " + ("" + value))
    }
})
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    pending = serial.readLine()
})
let s = 0
let m = 0
let h = 0
let pending = ""
let stamp = ""
let line = ""
let parts : string[] = []
let valueParts : string[] = []
radio.setGroup(1)
datalogger.setColumnTitles(
"timestamp",
"distance"
)
basic.forever(function () {
    if (pending != "") {
        line = pending
        pending = ""
        parts = _py.py_string_split(line, ":")
if (line.includes("CMD-TMST") && parts.length >= 2) {
            valueParts = _py.py_string_split(parts[1], "-")
if (valueParts.length == 3) {
                h = parseInt(valueParts[0])
                m = parseInt(valueParts[1])
                s = parseInt(valueParts[2])
                if (h >= 0 && h < 24 && m >= 0 && m < 60 && s >= 0 && s < 60) {
                    timeanddate.set24HourTime(h, m, s)
                    serial.writeLine("OK TIME " + timeanddate.time(timeanddate.TimeFormat.HHMMSS24hr))
                } else {
                    serial.writeLine("ERR TIME")
                }
            } else {
                serial.writeLine("ERR TIME")
            }
        } else if (line.includes("CMD-DTST") && parts.length >= 2) {
            valueParts = _py.py_string_split(parts[1], "-")
if (valueParts.length == 3) {
                timeanddate.setDate(parseInt(valueParts[0]), parseInt(valueParts[1]), parseInt(valueParts[2]))
                serial.writeLine("OK DATE " + timeanddate.date(timeanddate.DateFormat.YYYY_MM_DD))
            } else {
                serial.writeLine("ERR DATE")
            }
        } else if (line.includes("CMD-DST") && parts.length >= 2) {
            if (parseInt(parts[1]) > 0) {
                radio.sendValue("DST", parseInt(parts[1]))
            } else {
                serial.writeLine("ERR THRESHOLD")
            }
        } else if (line.includes("CMD-DRD")) {
            radio.sendValue("DRD", 0)
        } else if (line.includes("CMD-TMRD")) {
            serial.writeLine("TIME " + timeanddate.date(timeanddate.DateFormat.YYYY_MM_DD) + " " + timeanddate.time(timeanddate.TimeFormat.HHMMSS24hr))
        } else if (line.includes("CMD-FR")) {
            datalogger.deleteLog(datalogger.DeleteType.Full)
            serial.writeLine("OK FLASH RESET")
        } else {
            serial.writeLine("ERR UNKNOWN")
        }
        basic.pause(200)
    }
    basic.pause(100)
})
