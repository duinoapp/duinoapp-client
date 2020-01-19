/* global describe, it:true */


const chai = require('chai');

const { expect } = chai;
// var sinon = require('sinon'); //doesnt appear to browserify? using hosted version

const SerialPortFactory = require('../');

SerialPortFactory.extensionId = 'hibojdhogfadnkhgjhdihdlognbpbfnm';

const { SerialPort } = SerialPortFactory;

const exists = '/dev/ttyACM0';

describe('SerialPort', () => {
  let sandbox;
  let port;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach((done) => {
    sandbox.restore();

    if (!port) { return done(); }

    // closing on non open ports otherwise never returns...
    port = null;
    done();

    // port.close();
    // port.on('close', function(){
    //   return done();
    // });
  });

  describe('Factory', () => {
    it('is installed', (done) => {
      SerialPortFactory.isInstalled((err) => {
        expect(err).to.not.be.ok;
        done();
      });
    });

    it('lists ports', (done) => {
      SerialPortFactory.list((err, data) => {
        expect(err).to.not.be.ok;
        expect(data).to.exist;
        done();
      });
    });
  });

  describe('Constructor', () => {
    it('opens the port immediately', (done) => {
      port = new SerialPort(exists, ((err) => {
        expect(err).to.not.be.ok;
        done();
      }));
    });

    it('emits the open event', (done) => {
      port = new SerialPort(exists);
      port.on('open', () => {
        done();
      });
    });

    it.skip('emits an error on the factory when erroring without a callback', (done) => {
      // finish the test on error
      SerialPortFactory.once('error', (err) => {
        chai.assert.isDefined(err, "didn't get an error");
        done();
      });

      port = new SerialPort('/dev/johnJacobJingleheimerSchmidt');
    });

    it('emits an error on the serialport when explicit error handler present', (done) => {
      port = new SerialPort('/dev/johnJacobJingleheimerSchmidt');

      port.once('error', (err) => {
        chai.assert.isDefined(err);
        done();
      });
    });

    it('errors with invalid databits', (done) => {
      const errorCallback = function (err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      };

      port = new SerialPort(exists, { databits: 19 }, false, errorCallback);
    });

    it('errors with invalid stopbits', (done) => {
      const errorCallback = function (err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      };

      port = new SerialPort(exists, { stopBits: 19 }, false, errorCallback);
    });

    it('errors with invalid parity', (done) => {
      const errorCallback = function (err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      };

      port = new SerialPort(exists, { parity: 'something' }, false, errorCallback);
    });

    it('errors with invalid path', (done) => {
      const errorCallback = function (err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      };

      port = new SerialPort(null, false, errorCallback);
    });

    it('allows optional options', (done) => {
      port = new SerialPort(exists, (() => {}));
      expect(typeof port.options).to.eq('object');
      done();
    });
  });

  describe.skip('reading data', () => {
    it('emits data events by default', (done) => {
      const testData = new Buffer('I am a really short string');
      var port = new SerialPort(exists, options, (() => {
        port.once('data', (recvData) => {
          expect(recvData).to.eql(testData);
          done();
        });
        hardware.emitData(testData);
      }));
    });

    it('calls the dataCallback if set', (done) => {
      const testData = new Buffer('I am a really short string');
      const options = {};
      options.dataCallback = function (recvData) {
        expect(recvData).to.eql(testData);
        done();
      };

      const port = new SerialPort('exists', options, (() => {
        hardware.emitData(testData);
      }));
    });
  });

  describe.skip('#open', () => {
    it('passes the port to the bindings', (done) => {
      const openSpy = sandbox.spy(options.serial, 'connect');
      const port = new SerialPort(exists, options, false);
      port.open((err) => {
        expect(err).to.not.be.ok;
        expect(openSpy.calledWith('/dev/exists'));
        done();
      });
    });

    it('calls back an error when opening an invalid port', (done) => {
      const port = new SerialPort(exists, options, false);
      port.open((err) => {
        expect(err).to.be.ok;
        done();
      });
    });

    it('emits data after being reopened', (done) => {
      const data = new Buffer('Howdy!');
      var port = new SerialPort(exists, options, (() => {
        port.close();
        port.open(() => {
          port.once('data', (res) => {
            expect(res).to.eql(data);
            done();
          });
          hardware.emitData(data);
        });
      }));
    });
  });

  describe('close', () => {
    it("fires a close event when it's closed", (done) => {
      var port = new SerialPort(exists, (() => {
        const closeSpy = sandbox.spy();
        port.on('close', closeSpy);
        port.close();
        expect(closeSpy.calledOnce);
        done();
      }));
    });

    it('fires a close event after being reopened', (done) => {
      var port = new SerialPort(exists, (() => {
        const closeSpy = sandbox.spy();
        port.on('close', closeSpy);
        port.close();
        port.open();
        port.close();
        expect(closeSpy.calledTwice);
        done();
      }));
    });

    it('errors when closing an invalid port', (done) => {
      var port = new SerialPort(exists, (() => {
        port.on('close', () => {
          port.close((err) => {
            expect(err).to.be.ok;
            done();
          });
        });
        port.close();
      }));
    });
  });

  describe('#send', () => {
    it('errors when writing a closed port', (done) => {
      var port = new SerialPort(exists, (() => {
        port.on('close', () => {
          port.write(new Buffer(''), (err) => {
            expect(err).to.be.ok;
            done();
          });
        });
        port.close();
      }));
    });
  });

  describe.skip('disconnect', () => {
    it('fires a disconnect event', (done) => {
      const options = {};
      options.disconnectedCallback = function (err) {
        expect(err).to.be.ok;
        done();
      };
      const port = new SerialPort(exists, options, (() => {
        hardware.disconnect('/dev/exists');
      }));
    });
  });
});
