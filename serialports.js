var SerialPort = require("serialport").SerialPort
  var serialPort = new SerialPort("/dev/tty-usbserial1");
 serialport.list(function (err, ports) {
    ports.forEach(function(port) {
      console.log(port.comName);
      console.log(port.pnpId);
      console.log(port.manufacturer);
    });
  });