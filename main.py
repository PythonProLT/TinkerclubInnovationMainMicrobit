def on_data_received():
    global pending
    pending = serial.read_line()
serial.on_data_received(serial.delimiters(Delimiters.NEW_LINE), on_data_received)

def on_received_value(name, value):
    global stamp
    if name == "LOG":
        stamp = "" + timeanddate.date(timeanddate.DateFormat.YYYY_MM_DD) + " " + timeanddate.time(timeanddate.TimeFormat.HHMMSS2_4HR)
        datalogger.log(datalogger.create_cv("timestamp", stamp),
            datalogger.create_cv("distance", value))
        serial.write_line("" + stamp + "," + str(value))
    elif name == "DIST":
        serial.write_line("DIST " + str(value))
    elif name == "ACK":
        serial.write_line("OK THRESHOLD " + str(value))
radio.on_received_value(on_received_value)

stamp = ""
s = 0
m = 0
h = 0
valueParts: List[str] = []
parts: List[str] = []
line = ""
pending = ""
radio.set_group(1)
datalogger.set_column_titles("timestamp", "distance")

def on_forever():
    global line, pending, parts, valueParts, h, m, s
    if pending != "":
        line = pending
        pending = ""
        parts = line.split(":")
        if line.includes("CMD-TMST") and len(parts) >= 2:
            valueParts = parts[1].split("-")
            if len(valueParts) == 3:
                h = int(valueParts[0])
                m = int(valueParts[1])
                s = int(valueParts[2])
                if h >= 0 and h < 24 and m >= 0 and m < 60 and s >= 0 and s < 60:
                    timeanddate.set24_hour_time(h, m, s)
                    serial.write_line("OK TIME " + timeanddate.time(timeanddate.TimeFormat.HHMMSS2_4HR))
                else:
                    serial.write_line("ERR TIME")
            else:
                serial.write_line("ERR TIME")
        elif line.includes("CMD-DTST") and len(parts) >= 2:
            valueParts = parts[1].split("-")
            if len(valueParts) == 3:
                timeanddate.set_date(int(valueParts[0]), int(valueParts[1]), int(valueParts[2]))
                serial.write_line("OK DATE " + timeanddate.date(timeanddate.DateFormat.YYYY_MM_DD))
            else:
                serial.write_line("ERR DATE")
        elif line.includes("CMD-DST") and len(parts) >= 2:
            if int(parts[1]) > 0:
                radio.send_value("DST", int(parts[1]))
            else:
                serial.write_line("ERR THRESHOLD")
        elif line.includes("CMD-DRD"):
            radio.send_value("DRD", 0)
        elif line.includes("CMD-TMRD"):
            serial.write_line("TIME " + timeanddate.date(timeanddate.DateFormat.YYYY_MM_DD) + " " + timeanddate.time(timeanddate.TimeFormat.HHMMSS2_4HR))
        elif line.includes("CMD-FR"):
            datalogger.delete_log(datalogger.DeleteType.FULL)
            serial.write_line("OK FLASH RESET")
        else:
            serial.write_line("ERR UNKNOWN")
        basic.pause(200)
    basic.pause(100)
basic.forever(on_forever)