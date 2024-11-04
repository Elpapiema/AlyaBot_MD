/*⚠ PROHIBIDO EDITAR ⚠

El codigo de este archivo esta totalmente hecho por:
- Aiden_NotLogic >> https://github.com/ferhacks

El codigo de este archivo fue parchado por:
- ReyEndymion >> https://github.com/ReyEndymion
- BrunoSobrino >> https://github.com/BrunoSobrino

Contenido adaptado por:
- GataNina-Li >> https://github.com/GataNina-Li
- elrebelde21 >> https://github.com/elrebelde21
*/

const {
  DisconnectReason,
  useMultiFileAuthState,
  MessageRetryMap,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser
} = await import('@whiskeysockets/baileys');
import _0x1553f5 from 'qrcode';
import _0x1dd468 from 'fs';
import _0x49b68c from 'pino';
import 'ws';
const {
  child,
  spawn,
  exec
} = await import("child_process");
import { makeWASocket } from '../lib/simple.js';
import _0x3833eb from '../lib/store.js';
import _0x154561 from 'node-cache';
if (!(global.conns instanceof Array)) {
  global.conns = [];
}
if (!(global.dataconst instanceof Array)) {
  global.dataconst = [];
}
let handler = async (_0x19e8f9, {
  conn: _0x50cbb4,
  args: _0x4241dd,
  usedPrefix: _0x5ad741,
  command: _0x820045,
  isOwner: _0x33d68e,
  text: _0x4cf95f
}) => {
  const _0x21e64f = Buffer.from("CkphZGlib3QsIEhlY2hvIHBvciBAQWlkZW5fTm90TG9naWM", "base64");
  async function _0x1ab868() {
    let _0x4a4443 = _0x19e8f9.mentionedJid && _0x19e8f9.mentionedJid[0x0] ? _0x19e8f9.mentionedJid[0x0] : _0x19e8f9.fromMe ? _0x50cbb4.user.jid : _0x19e8f9.sender;
    let _0x1e1a47 = '' + _0x4a4443.split`@`[0x0];
    let _0x5b2212 = _0x4241dd[0x0] && _0x4241dd[0x0].includes("--code") ? true : !!(_0x4241dd[0x1] && _0x4241dd[0x1].includes('--code'));
    if (_0x5b2212) {
      _0x4241dd[0x0] = _0x4241dd[0x0].replace('--code', '').trim();
      if (_0x4241dd[0x1]) {
        _0x4241dd[0x1] = _0x4241dd[0x1].replace("--code", '').trim();
      }
      if (_0x4241dd[0x0] == '') {
        _0x4241dd[0x0] = undefined;
      }
    }
    if (!_0x1dd468.existsSync("./Alya-SubBots/" + _0x1e1a47)) {
      _0x1dd468.mkdirSync('./Alya-SubBots/' + _0x1e1a47, {
        'recursive': true
      });
    }
    if (_0x4241dd[0x0]) {
      _0x1dd468.writeFileSync("./Alya-SubBots/" + _0x1e1a47 + '/creds.json', JSON.stringify(JSON.parse(Buffer.from(_0x4241dd[0x0], "base64").toString("utf-8")), null, "\t"));
    }
    if (_0x1dd468.existsSync('./Alya-SubBots/' + _0x1e1a47 + "/creds.json")) {
      let _0x4a2d5c = JSON.parse(_0x1dd468.readFileSync("./Alya-SubBots/" + _0x1e1a47 + "/creds.json"));
      if (_0x4a2d5c) {
        if (_0x4a2d5c.registered = false) {
          _0x1dd468.unlinkSync("./Alya-SubBots/" + _0x1e1a47 + "/creds.json");
        }
      }
    }
    const {
      state: _0x53ad20,
      saveState: _0x2d64a2,
      saveCreds: _0x1e1b6d
    } = await useMultiFileAuthState("./jadibts/" + _0x1e1a47);
    const _0x2aade5 = new _0x154561();
    const {
      version: _0xb4318
    } = await fetchLatestBaileysVersion();
    const _0x443671 = {
      'printQRInTerminal': false,
      'auth': {
        'creds': _0x53ad20.creds,
        'keys': makeCacheableSignalKeyStore(_0x53ad20.keys, _0x49b68c({
          'level': "silent"
        }))
      },
      'logger': _0x49b68c({
        'level': "silent"
      }),
      'browser': _0x5b2212 ? ["Ubuntu", "Chrome", "20.0.04"] : ["Sub-bot", "Safari", '2.0.0'],
      'markOnlineOnConnect': true,
      'generateHighQualityLinkPreview': true,
      'getMessage': async _0x3d4cec => {
        let _0x380da3 = jidNormalizedUser(_0x3d4cec.remoteJid);
        let _0x393d89 = await _0x3833eb.loadMessage(_0x380da3, _0x3d4cec.id);
        return _0x393d89?.["message"] || '';
      },
      'msgRetryCounterCache': _0x2aade5,
      'version': _0xb4318
    };
    let _0x265d8b = makeWASocket(_0x443671);
    _0x265d8b.isInit = false;
    _0x265d8b.uptime = Date.now();
    let _0x49a9d7 = true;
    async function _0x45ef36(_0x76ed40) {
      const {
        connection: _0x2c2072,
        lastDisconnect: _0x124d59,
        isNewLogin: _0x757492,
        qr: _0x1a7de1
      } = _0x76ed40;
      if (_0x757492) {
        _0x265d8b.isInit = false;
      }
      if (_0x1a7de1 && !_0x5b2212) {
        _0x50cbb4.sendMessage(_0x19e8f9.chat, {
          'image': await _0x1553f5.toBuffer(_0x1a7de1, {
            'scale': 0x8
          }),
          'caption': "*🔰 AlyaBot-MD 🔰*\n          *Ser sub bot*\n\n*Con otro telefono que tengas o en la PC escanea este QR para convertirte en un sub bot*\n\n*1. Haga clic en los tres puntos en la esquina superior derecha*\n*2. Toca WhatsApp Web*\n*3. Escanee este codigo QR*\n*Este código QR expira en 60 segundos!*\n\n*⚠️ No nos hacemos responsable del mal uso que se le pueda dar o si el numero se manda a soporte.. ustedes tienen el deber se seguir al pie de la letra los terminos y condiciones y privacidad (escribe eso y te los dará)*\n" + _0x21e64f.toString("utf-8")
        }, {
          'quoted': _0x19e8f9
        });
      }
      if (_0x1a7de1 && _0x5b2212) {
        let _0x5c7b6e = _0x19e8f9.sender.split`@`[0x0];
        if (_0x5c7b6e.startsWith('52')) {
          _0x5c7b6e = "521" + _0x5c7b6e.slice(0x2);
        }
        let _0x56a591 = await _0x265d8b.requestPairingCode(_0x5c7b6e);
        _0x50cbb4.sendMessage(_0x19e8f9.chat, {
          'text': "*🔰 AlyaBot-MD 🔰*\n          *Ser sub bot*\n\n*En breve, Se le enviara un codigo que debera introducir para instalar el bot*\n\n*Pasos a seguir:*\n*1.- Haga click en los 3 puntos ubicados en la esquina superior derecha en el inicio de su WhatsApp*\n*2.- Toca en donde dice WhatsApp web o dispositivos vinculados*\n*3.- De click en donde dice \"Vincular con el numero de telefono\"*\n*4.- Introduzca el codigo*\n*El codigo expira en 60 segundos!!*\n*El codigo solo funciona con el numero solicitado!!*\n" + _0x21e64f.toString('utf-8')
        }, {
          'quoted': _0x19e8f9
        });
        await delay(0x1388);
        _0x50cbb4.sendMessage(_0x19e8f9.chat, {
          'text': _0x56a591
        }, {
          'quoted': _0x19e8f9
        });
      }
      const _0x2fa263 = _0x124d59?.["error"]?.["output"]?.["statusCode"] || _0x124d59?.['error']?.['output']?.["payload"]?.["statusCode"];
      if (_0x2c2072 === "close") {
        if (_0x265d8b.user && dataconst[_0x265d8b.user.id.split('@')] == 0x3) {
          return _0x50cbb4.sendMessage(_0x19e8f9.chat, {
            'text': "*⚠️ Se ha alcanzado el limite de reconexiones, por favor intente mas tarde.*"
          }, {
            'quoted': _0x19e8f9
          });
        }
        if (_0x2fa263 == 0x195 || _0x2fa263 == 0x194) {
          _0x1dd468.unlinkSync("./jadibts/" + _0x1e1a47 + "/creds.json");
          return _0x1ab868();
        }
        if (_0x2fa263 === DisconnectReason.badSession) {
          _0x50cbb4.sendMessage(_0x19e8f9.chat, {
            'text': "*⚠️ La sesión actual es inválida, Tendras que iniciar sesion de nuevo."
          }, {
            'quoted': _0x19e8f9
          });
          _0x1dd468.rmdirSync('./Alya-SubBots/' + _0x1e1a47, {
            'recursive': true
          });
        } else {
          if (_0x2fa263 === DisconnectReason.connectionClosed) {
            if (_0x265d8b.fstop) {
              return _0x50cbb4.sendMessage(_0x19e8f9.chat, {
                'text': "*⚠️ El bot se ha apagado correctamente!!*"
              }, {
                'quoted': _0x19e8f9
              });
            }
            if (!_0x265d8b.fstop) {
              _0x50cbb4.sendMessage(_0x19e8f9.chat, {
                'text': "*⚠️ La conexión se cerró, se intentara reconectar automáticamente...*\n" + dataconst[_0x265d8b.user.id.split('@')] + '/3'
              }, {
                'quoted': _0x19e8f9
              });
            }
            if (!_0x265d8b.fstop) {
              await _0x43ed4c(true)["catch"](console.error);
            }
          } else {
            if (_0x2fa263 === DisconnectReason.connectionLost) {
              _0x50cbb4.sendMessage(_0x19e8f9.chat, {
                'text': "*⚠️ La conexión se perdió, se intentara reconectar automáticamente...*\n" + dataconst[_0x265d8b.user.id.split('@')] + '/3'
              }, {
                'quoted': _0x19e8f9
              });
              await _0x43ed4c(true)["catch"](console.error);
            } else {
              if (_0x2fa263 === DisconnectReason.connectionReplaced) {
                _0x50cbb4.sendMessage(_0x19e8f9.chat, {
                  'text': "*⚠️ La conexión se reemplazó, Su conexion se cerro*\n\n*Para volver a conectarte usa:*\n" + _0x5ad741 + _0x820045
                }, {
                  'quoted': _0x19e8f9
                });
              } else {
                if (_0x2fa263 === DisconnectReason.loggedOut) {
                  _0x50cbb4.sendMessage(_0x19e8f9.chat, {
                    'text': "*⚠️ Conexión perdida.. envie el mensaje que se envio al numero donde escaneo el codigo qr*"
                  }, {
                    'quoted': _0x19e8f9
                  });
                  return _0x1dd468.rmdirSync("./Alya-SubBots/" + _0x1e1a47, {
                    'recursive': true
                  });
                } else {
                  if (_0x2fa263 === DisconnectReason.restartRequired) {
                    await _0x43ed4c(true)["catch"](console.error);
                  } else if (_0x2fa263 === DisconnectReason.timedOut) {
                    _0x50cbb4.sendMessage(_0x19e8f9.chat, {
                      'text': "*⚠️La conexión se agotó, se intentara reconectar automáticamente...*\n" + dataconst[_0x265d8b.user.id.split('@')] + '/3'
                    }, {
                      'quoted': _0x19e8f9
                    });
                    await _0x43ed4c(true)["catch"](console.error);
                  } else {
                    _0x50cbb4.sendMessage(_0x19e8f9.chat, {
                      'text': "⚠️ Razón de desconexión desconocida. " + (_0x2fa263 || '') + ": " + (_0x2c2072 || '') + " Por favor reporte al desarollador."
                    }, {
                      'quoted': _0x19e8f9
                    });
                  }
                }
              }
            }
          }
        }
        let _0x2a1dce = global.conns.indexOf(_0x265d8b);
        if (_0x2a1dce < 0x0) {
          return console.log("no se encontro");
        }
        delete global.conns[_0x2a1dce];
        global.conns.splice(_0x2a1dce, 0x1);
      }
      if (global.db.data == null) {
        loadDatabase();
      }
      if (_0x2c2072 == "open") {
        _0x265d8b.isInit = true;
        global.conns.push(_0x265d8b);
        await _0x50cbb4.sendMessage(_0x19e8f9.chat, {
          'text': _0x4241dd[0x0] ? "✅Conectado exitosamente con whatsapp*" : "*Conectado exitosamente con WhatsApp ✅*\n\n*Nota:* Esto es temporal Si el Bot principal se reinicia o se desactiva, todos los sub bots tambien lo haran\n\nPuede iniciar sesión sin el codigo qr con el siguiente mensaje, envialo cuando no funcione el bot...."
        }, {
          'quoted': _0x19e8f9
        });
        if (_0x2c2072 === "open") {
          dataconst[_0x265d8b.user.id.split('@')] = 0x1;
          _0x50cbb4.sendMessage(_0x19e8f9.chat, {
            'text': "*✅Ya estas conectado, Por favor espere se esta cargado los mensajes....*\n\n*🙌️ OPCIONES DISPONIBLES:*\n*🔸#stop _(Detener la función Sub Bot)_*\n*🔸 #eliminarsesion _(Borrar todo rastro de Sub Bot)_*\n*🔸 #serbot _(Obtener nuevo código QR para ser Sub Bot)_*"
          }, {
            'quoted': _0x19e8f9
          });
          return console.log(await _0x43ed4c(false)["catch"](console.error));
        }
        await sleep(0x1388);
        if (!_0x4241dd[0x0]) {
          _0x50cbb4.sendMessage(_0x19e8f9.chat, {
            'text': _0x5ad741 + _0x820045 + " " + Buffer.from(_0x1dd468.readFileSync("./Alya-SubBots/" + _0x1e1a47 + "/creds.json"), 'utf-8').toString('base64')
          }, {
            'quoted': _0x19e8f9
          });
        }
      }
    }
    setInterval(async () => {
      if (!_0x265d8b.user) {
        try {
          _0x265d8b.ws.close();
        } catch {}
        _0x265d8b.ev.removeAllListeners();
        let _0x8d27ba = global.conns.indexOf(_0x265d8b);
        if (_0x8d27ba < 0x0) {
          return;
        }
        delete global.conns[_0x8d27ba];
        global.conns.splice(_0x8d27ba, 0x1);
      }
    }, 0xea60);
    let _0x416a26 = global.handler;
    let _0x43ed4c = async function (_0x5bc522) {
      try {
        const _0x56bae3 = await import('../handler.js?update=' + Date.now())["catch"](console.error);
        if (Object.keys(_0x56bae3 || {}).length) {
          _0x416a26 = _0x56bae3;
        }
      } catch (_0xb9b414) {
        console.error(_0xb9b414);
      }
      if (_0x5bc522) {
        try {
          _0x265d8b.ws.close();
        } catch {}
        _0x265d8b.ev.removeAllListeners();
        _0x265d8b = makeWASocket(_0x443671);
        _0x49a9d7 = true;
      }
      if (_0x265d8b.user && _0x265d8b.user.id && !dataconst[_0x265d8b.user.id.split('@')]) {
        dataconst[_0x265d8b.user.id.split('@')] = 0x0;
      }
      if (_0x265d8b.user && _0x265d8b.user.id && dataconst[_0x265d8b.user.id.split('@')] && _0x5bc522) {
        dataconst[_0x265d8b.user.id.split('@')]++;
      }
      if (!_0x49a9d7) {
        _0x265d8b.ev.off("messages.upsert", _0x265d8b.handler);
        _0x265d8b.ev.off("group-participants.update", _0x265d8b.participantsUpdate);
        _0x265d8b.ev.off("groups.update", _0x265d8b.groupsUpdate);
        _0x265d8b.ev.off('message.delete', _0x265d8b.onDelete);
        _0x265d8b.ev.off("call", _0x265d8b.onCall);
        _0x265d8b.ev.off('connection.update', _0x265d8b.connectionUpdate);
        _0x265d8b.ev.off("creds.update", _0x265d8b.credsUpdate);
      }
      _0x265d8b.handler = _0x416a26.handler.bind(_0x265d8b);
      _0x265d8b.participantsUpdate = _0x416a26.participantsUpdate.bind(_0x265d8b);
      _0x265d8b.groupsUpdate = _0x416a26.groupsUpdate.bind(_0x265d8b);
      _0x265d8b.onDelete = _0x416a26.deleteUpdate.bind(_0x265d8b);
      _0x265d8b.onCall = _0x416a26.callUpdate.bind(_0x265d8b);
      _0x265d8b.connectionUpdate = _0x45ef36.bind(_0x265d8b);
      _0x265d8b.credsUpdate = _0x1e1b6d.bind(_0x265d8b, true);
      _0x265d8b.ev.on("messages.upsert", _0x265d8b.handler);
      _0x265d8b.ev.on("group-participants.update", _0x265d8b.participantsUpdate);
      _0x265d8b.ev.on("groups.update", _0x265d8b.groupsUpdate);
      _0x265d8b.ev.on("message.delete", _0x265d8b.onDelete);
      _0x265d8b.ev.on("call", _0x265d8b.onCall);
      _0x265d8b.ev.on('connection.update', _0x265d8b.connectionUpdate);
      _0x265d8b.ev.on("creds.update", _0x265d8b.credsUpdate);
      _0x265d8b.subreloadHandler = _0x43ed4c;
      _0x49a9d7 = false;
      return true;
    };
    _0x43ed4c(false);
  }
  _0x1ab868();
};
handler.help = ["jadibot", "serbot", "jadibot --code", "serbot --code"];
handler.tags = ["jadibot"];
handler.command = /^(jadibot|serbot|getcode|rentbot|code)$/i;
handler.register = true;
export default handler;
const delay = _0x48db76 => new Promise(_0x27f61b => setTimeout(_0x27f61b, _0x48db76));
function sleep(_0x56796f) {
  return new Promise(_0x314a70 => setTimeout(_0x314a70, _0x56796f));
}