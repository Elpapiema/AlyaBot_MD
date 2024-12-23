const {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} = await import(global.baileys);
import _0x3273bc from 'qrcode';
import _0x233879 from 'node-cache';
import _0x42f252 from 'fs';
import 'path';
import _0x29a17d from 'pino';
import 'util';
import 'ws';
const {
  child,
  spawn,
  exec
} = await import('child_process');
import { makeWASocket } from '../lib/simple.js';
if (global.conns instanceof Array) {
  console.log();
} else {
  global.conns = [];
}
let handler = async (_0x5dc7f8, {
  conn: _0x46fb82,
  args: _0x26550f,
  usedPrefix: _0x39a2c8,
  command: _0x47cb36,
  isOwner: _0x59bcb5
}) => {
  const _0x2b7f1c = _0x26550f[0x0] && /(--code|code)/.test(_0x26550f[0x0].trim()) ? true : !!(_0x26550f[0x1] && /(--code|code)/.test(_0x26550f[0x1].trim()));
  let _0x214678;
  let _0x35baea;
  let _0x47379d;
  let _0x154f42 = _0x5dc7f8.mentionedJid && _0x5dc7f8.mentionedJid[0x0] ? _0x5dc7f8.mentionedJid[0x0] : _0x5dc7f8.fromMe ? _0x46fb82.user.jid : _0x5dc7f8.sender;
  let _0x3b3505 = '' + _0x154f42.split`@`[0x0];
  if (_0x2b7f1c) {
    _0x26550f[0x0] = _0x26550f[0x0].replace(/^--code$|^code$/, '').trim();
    if (_0x26550f[0x1]) {
      _0x26550f[0x1] = _0x26550f[0x1].replace(/^--code$|^code$/, '').trim();
    }
    if (_0x26550f[0x0] == '') {
      _0x26550f[0x0] = undefined;
    }
  }
  if (!_0x42f252.existsSync("./Alya-SubBots/" + _0x3b3505)) {
    _0x42f252.mkdirSync("./Alya-SubBots/" + _0x3b3505, {
      'recursive': true
    });
  }
  if (_0x26550f[0x0] && _0x26550f[0x0] != undefined) {
    _0x42f252.writeFileSync("./Alya-SubBots/" + _0x3b3505 + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(_0x26550f[0x0], "base64").toString("utf-8")), null, "\t"));
  } else {
    '';
  }
  if (_0x42f252.existsSync('./Alya-SubBots/' + _0x3b3505 + "/creds.json")) {
    let _0x5867d6 = JSON.parse(_0x42f252.readFileSync("./Alya-SubBots/" + _0x3b3505 + "/creds.json"));
    if (_0x5867d6) {
      if (_0x5867d6.registered = false) {
        _0x42f252.unlinkSync("./Alya-SubBots/" + _0x3b3505 + "/creds.json");
      }
    }
  }
  const _0x53088f = Buffer.from("Y2QgcGx1Z2lucyA7IG1kNXN1bSBpbmZvLWRvbmFyLmpzIF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz", "base64");
  exec(_0x53088f.toString("utf-8"), async (_0x116b0d, _0x444659, _0x5fce62) => {
    const _0x376019 = Buffer.from("CkphZGlib3QsIEhlY2hvIHBvciBAQWlkZW5fTm90TG9naWM", "base64");
    async function _0x55fb84() {
      let _0x156f14 = _0x5dc7f8.mentionedJid && _0x5dc7f8.mentionedJid[0x0] ? _0x5dc7f8.mentionedJid[0x0] : _0x5dc7f8.fromMe ? _0x46fb82.user.jid : _0x5dc7f8.sender;
      let _0x3f1d2c = '' + _0x156f14.split`@`[0x0];
      if (!_0x42f252.existsSync("./Alya-SubBots/" + _0x3f1d2c)) {
        _0x42f252.mkdirSync("./Alya-SubBots/" + _0x3f1d2c, {
          'recursive': true
        });
      }
      if (_0x26550f[0x0]) {
        _0x42f252.writeFileSync("./Alya-SubBots/" + _0x3f1d2c + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(_0x26550f[0x0], "base64").toString("utf-8")), null, "\t"));
      } else {
        '';
      }
      let {
        version: _0x3e4fbb,
        isLatest: _0x73fd10
      } = await fetchLatestBaileysVersion();
      const _0x1236ab = _0x1a89cf => {};
      const _0x3ac438 = new _0x233879();
      const {
        state: _0x685d73,
        saveState: _0x5bd3c9,
        saveCreds: _0x19b9bd
      } = await useMultiFileAuthState('./Alya-SubBots/' + _0x3f1d2c);
      const _0x66e88f = {
        'printQRInTerminal': false,
        'logger': _0x29a17d({
          'level': "silent"
        }),
        'auth': {
          'creds': _0x685d73.creds,
          'keys': makeCacheableSignalKeyStore(_0x685d73.keys, _0x29a17d({
            'level': 'silent'
          }))
        },
        'msgRetry': _0x1236ab,
        'msgRetryCache': _0x3ac438,
        'version': [0x2, 0xbb8, 0x3c8d6c7b],
        'syncFullHistory': true,
        'browser': _0x2b7f1c ? ["Alya_Bot (Sub-Bot)", "Chrome", "110.0.5585.95"] : ["Alya_Bot (SubBot)", "Chrome", "2.0.0"],
        'defaultQueryTimeoutMs': undefined,
        'getMessage': async _0x330330 => {
          if (store) {}
          return {
            'conversation': "Alya_Bot"
          };
        }
      };
      let _0x2b89c6 = makeWASocket(_0x66e88f);
      _0x2b89c6.isInit = false;
      let _0x4a6b81 = true;
      async function _0x3d8adb(_0x49c8ab) {
        const {
          connection: _0x3d81f9,
          lastDisconnect: _0xa9c63b,
          isNewLogin: _0x41d868,
          qr: _0x46fc01
        } = _0x49c8ab;
        if (_0x41d868) {
          _0x2b89c6.isInit = false;
        }
        if (_0x46fc01 && !_0x2b7f1c) {
          try {
            _0x47379d = await _0x46fb82.sendMessage(_0x5dc7f8.chat, {
              'image': await _0x3273bc.toBuffer(_0x46fc01, {
                'scale': 0x8
              }),
              'caption': "*🔰 Alya_Bot 🔰*\nㅤㅤㅤㅤ*Ser sub bot*\n\n*Con otro telefono que tengas o en la PC escanea este QR para convertirte en un sub bot*\n\n*1. Haga clic en los tres puntos en la esquina superior derecha*\n*2. Toca WhatsApp Web*\n*3. Escanee este codigo QR*\n*Este código QR expira en 45 segundos!*\n\n> *⚠️ No nos hacemos responsable del mal uso que se le pueda dar o si el numero se manda a soporte.. ustedes tienen el deber se seguir al pie de la letra los terminos y condiciones y privacidad (escribe eso y te los dará)*\n" + _0x376019.toString("utf-8")
            }, {
              'quoted': _0x5dc7f8
            });
            setTimeout(async () => {
              try {
                if (_0x47379d && _0x47379d.key) {
                  await _0x46fb82.sendMessage(_0x5dc7f8.sender, {
                    'delete': _0x47379d.key
                  });
                }
              } catch (_0x11a8fa) {
                console.error("Error al borrar el mensaje del QR:", _0x11a8fa);
              }
            }, 0x7530);
          } catch (_0x5b851d) {
            console.error("Error al enviar el mensaje con QR:", _0x5b851d);
          }
          return;
        }
        if (_0x46fc01 && _0x2b7f1c) {
          try {
            _0x214678 = await _0x46fb82.sendMessage(_0x5dc7f8.chat, {
              'text': "🟢 *_NUEVA FUNCIÓN DE HACERTE UN SUB BOT_* 🟢\n\n*1️⃣ Diríjase en los tres puntos en la esquina superior derecha*\n*2️⃣ Ir a la opción Dispositivos vinculados*\n*3️⃣ da click en vincular con codigo de teléfono*\n*4️⃣ pega el codigo a continuación*\n\n> *⚠️ No nos hacemos responsable del mal uso que se le pueda dar o si el numero se manda a soporte.. ustedes tienen el deber se seguir al pie de la letra los terminos y condiciones y privacidad (escribe eso y te los dará)*\n" + _0x376019.toString("utf-8")
            }, {
              'quoted': _0x5dc7f8
            });
            await sleep(0xbb8);
            let _0x41c6d1 = await _0x2b89c6.requestPairingCode(_0x5dc7f8.sender.split`@`[0x0]);
            _0x35baea = await _0x5dc7f8.reply(_0x41c6d1);
            setTimeout(async () => {
              try {
                if (_0x214678 && _0x214678.key) {
                  await _0x46fb82.sendMessage(_0x5dc7f8.sender, {
                    'delete': _0x214678.key
                  });
                }
              } catch (_0x35d3db) {
                console.error("Error al borrar el mensaje del código:", _0x35d3db);
              }
            }, 0x7530);
            setTimeout(async () => {
              try {
                if (_0x35baea && _0x35baea.key) {
                  await _0x46fb82.sendMessage(_0x5dc7f8.sender, {
                    'delete': _0x35baea.key
                  });
                }
              } catch (_0x4c54f2) {
                console.error("Error al borrar el mensaje del código del bot:", _0x4c54f2);
              }
            }, 0x7530);
          } catch (_0xa6a504) {
            console.error("Error en el flujo de QR con mcode:", _0xa6a504);
          }
        }
        const _0x55a77f = _0xa9c63b?.['error']?.["output"]?.["statusCode"] || _0xa9c63b?.["error"]?.["output"]?.["payload"]?.['statusCode'];
        console.log(_0x55a77f);
        const _0x47328f = async _0xcf33a5 => {
          if (!_0xcf33a5) {
            try {
              _0x2b89c6.ws.close();
            } catch (_0x3c69be) {
              console.error("Error al cerrar la conexión WebSocket:", _0x3c69be);
            }
            _0x2b89c6.ev.removeAllListeners();
            let _0x30798e = global.conns.indexOf(_0x2b89c6);
            if (_0x30798e < 0x0) {
              return;
            }
            delete global.conns[_0x30798e];
            global.conns.splice(_0x30798e, 0x1);
          }
        };
        const _0x469ed6 = _0xa9c63b?.["error"]?.["output"]?.['statusCode'] || _0xa9c63b?.["error"]?.["output"]?.['payload']?.["statusCode"];
        if (_0x3d81f9 === 'close') {
          console.log(_0x469ed6);
          if (_0x469ed6 == 0x195) {
            await _0x42f252.unlinkSync("./Alya-SubBots/" + _0x3f1d2c + "/creds.json");
            return await _0x5dc7f8.reply("*🟢 REENVIAR NUEVAMENTE EL COMANDO....*");
          }
          if (_0x469ed6 === DisconnectReason.restartRequired) {
            _0x55fb84();
            return console.log("⚠️ CONEXIÓN REEMPLAZADA, SE HA ABIERTO OTRA NUEVA SESION, POR FAVOR, CIERRA LA SESIÓN ACTUAL PRIMERO");
          } else {
            if (_0x469ed6 === DisconnectReason.loggedOut) {
              sleep(0xfa0);
              return _0x5dc7f8.reply("🔴 *LA CONEXIÓN SE HA CERRADO, TENDRAS QUE VOLVER A CONECTARSE USANDO:*\n#deletesesion (Para borrar los datos y poder volver a solita el QR o el code)");
            } else {
              if (_0x469ed6 == 0x1ac) {
                await _0x47328f(false);
                return _0x5dc7f8.reply("🟡 *LA CONEXIÓN SE HA CERRADO DE MANERA INESPERADA, INTENTAREMOS RECONECTAR...*");
              } else {
                if (_0x469ed6 === DisconnectReason.connectionLost) {
                  await _0x55fb84();
                  return console.log("⚠️ CONEXIÓN PERDIDA CON EL SERVIDOR, RECONECTANDO...");
                } else {
                  if (_0x469ed6 === DisconnectReason.badSession) {
                    return await _0x5dc7f8.reply("🔴 *LA CONEXIÓN SE HA CERRADO, DEBERÁ DE CONECTARSE MANUALMENTE USANDO EL COMANDO #serbot Y REESCANEAR EL NUEVO CÓDIGO QR*");
                  } else {
                    if (_0x469ed6 === DisconnectReason.timedOut) {
                      await _0x47328f(false);
                      return console.log("⌛ TIEMPO DE CONEXIÓN AGOTADO, RECONECTANDO...");
                    } else {
                      console.log("⚠️❗ RAZON DE DESCONEXIÓN DESCONOCIDA: " + (_0x469ed6 || '') + " >> " + (_0x3d81f9 || ''));
                    }
                  }
                }
              }
            }
          }
        }
        if (global.db.data == null) {
          loadDatabase();
        }
        if (_0x3d81f9 == "open") {
          _0x2b89c6.isInit = true;
          global.conns.push(_0x2b89c6);
          await _0x46fb82.sendMessage(_0x5dc7f8.chat, {
            'text': _0x26550f[0x0] ? "*✅ Ya esta conectado!! Por favor espere se esta cargador los mensajes.....*" : "*Conectado exitosamente con WhatsApp ✅*\n\n*💻 Bot:* +" + _0x5dc7f8.sender.split`@`[0x0] + "\n*👤 Dueño:* " + (_0x5dc7f8.pushName || "Anónimo") + "\n\n*Nota: Esto es temporal*\nSi el Bot principal se reinicia o se desactiva, todos los sub bots tambien lo haran\n\n> *Unirte a nuestro canal para informarte de todas la Actualizaciónes/novedades sobre el bot*\n" + nna2
          }, {
            'quoted': _0x5dc7f8
          });
          let _0x128aff = ("*Se detectó un nuevo Sub-Bot conectado 💻✨*\n\n*✨ Bot :* wa.me/" + _0x5dc7f8.sender.split`@`[0x0] + "\n*👤 Dueño :* " + (_0x5dc7f8.pushName || 'Anónimo') + "\n*🔑 Método de conexión :* " + (_0x2b7f1c ? "Código de 8 dígitos" : "Código QR") + "\n*💻 Navegador :* " + (_0x2b7f1c ? "Ubuntu" : "Chrome") + "\n").trim();
          let _0x3735ba = await _0x2b89c6.profilePictureUrl(_0x156f14, "image")["catch"](_0x35357a => imageUrl.getRandom());
          await sleep(0xbb8);
          await _0x46fb82.sendMessage(ch.ch1, {
            'text': _0x128aff,
            'contextInfo': {
              'externalAdReply': {
                'title': "【 📢 Notificación General 📢 】",
                'body': "🥳 ¡Nuevo Sub-Bot conectado!",
                'thumbnailUrl': _0x3735ba,
                'sourceUrl': [nna, nna2, nn, md, yt, tiktok].getRandom(),
                'mediaType': 0x1,
                'showAdAttribution': false,
                'renderLargerThumbnail': false
              }
            }
          }, {
            'quoted': null
          });
          await sleep(0xbb8);
          await joinChannels(_0x2b89c6);
          if (!_0x26550f[0x0]) {
            _0x46fb82.sendMessage(_0x5dc7f8.chat, {
              'text': _0x39a2c8 + _0x47cb36 + " " + Buffer.from(_0x42f252.readFileSync("./Alya-SubBots/" + _0x3f1d2c + "/creds.json"), 'utf-8').toString("base64")
            }, {
              'quoted': _0x5dc7f8
            });
          }
        }
      }
      setInterval(async () => {
        if (!_0x2b89c6.user) {
          try {
            _0x2b89c6.ws.close();
          } catch (_0x23c849) {
            console.log(await _0x10642a(true)["catch"](console.error));
          }
          _0x2b89c6.ev.removeAllListeners();
          let _0x373c67 = global.conns.indexOf(_0x2b89c6);
          if (_0x373c67 < 0x0) {
            return;
          }
          delete global.conns[_0x373c67];
          global.conns.splice(_0x373c67, 0x1);
        }
      }, 0xea60);
      let _0x1d6336 = await import('../handler.js');
      let _0x10642a = async function (_0x1c420d) {
        try {
          const _0x1e6e31 = await import("../handler.js?update=" + Date.now())['catch'](console.error);
          if (Object.keys(_0x1e6e31 || {}).length) {
            _0x1d6336 = _0x1e6e31;
          }
        } catch (_0x36b3b2) {
          console.error(_0x36b3b2);
        }
        if (_0x1c420d) {
          const _0x3a44e0 = _0x2b89c6.chats;
          try {
            _0x2b89c6.ws.close();
          } catch {}
          _0x2b89c6.ev.removeAllListeners();
          _0x2b89c6 = makeWASocket(_0x66e88f, {
            'chats': _0x3a44e0
          });
          _0x4a6b81 = true;
        }
        if (!_0x4a6b81) {
          _0x2b89c6.ev.off("messages.upsert", _0x2b89c6.handler);
          _0x2b89c6.ev.off("group-participants.update", _0x2b89c6.participantsUpdate);
          _0x2b89c6.ev.off('groups.update', _0x2b89c6.groupsUpdate);
          _0x2b89c6.ev.off("message.delete", _0x2b89c6.onDelete);
          _0x2b89c6.ev.off("call", _0x2b89c6.onCall);
          _0x2b89c6.ev.off("connection.update", _0x2b89c6.connectionUpdate);
          _0x2b89c6.ev.off("creds.update", _0x2b89c6.credsUpdate);
        }
        _0x2b89c6.welcome = global.conn.welcome + '';
        _0x2b89c6.bye = global.conn.bye + '';
        _0x2b89c6.spromote = global.conn.spromote + '';
        _0x2b89c6.sdemote = global.conn.sdemote + '';
        _0x2b89c6.sDesc = global.conn.sDesc + '';
        _0x2b89c6.sSubject = global.conn.sSubject + '';
        _0x2b89c6.sIcon = global.conn.sIcon + '';
        _0x2b89c6.sRevoke = global.conn.sRevoke + '';
        _0x2b89c6.handler = _0x1d6336.handler.bind(_0x2b89c6);
        _0x2b89c6.participantsUpdate = _0x1d6336.participantsUpdate.bind(_0x2b89c6);
        _0x2b89c6.groupsUpdate = _0x1d6336.groupsUpdate.bind(_0x2b89c6);
        _0x2b89c6.onDelete = _0x1d6336.deleteUpdate.bind(_0x2b89c6);
        _0x2b89c6.onCall = _0x1d6336.callUpdate.bind(_0x2b89c6);
        _0x2b89c6.connectionUpdate = _0x3d8adb.bind(_0x2b89c6);
        _0x2b89c6.credsUpdate = _0x19b9bd.bind(_0x2b89c6, true);
        const _0x3e5ed1 = new Date();
        const _0x3385d2 = new Date(_0x2b89c6.ev * 0x3e8);
        if (_0x3e5ed1.getTime() - _0x3385d2.getTime() <= 0x493e0) {
          console.log("Leyendo mensaje entrante:", _0x2b89c6.ev);
          Object.keys(_0x2b89c6.chats).forEach(_0x104b43 => {
            _0x2b89c6.chats[_0x104b43].isBanned = false;
          });
        } else {
          console.log(_0x2b89c6.chats, "Omitiendo mensajes en espera.", _0x2b89c6.ev);
          Object.keys(_0x2b89c6.chats).forEach(_0x167aa1 => {
            _0x2b89c6.chats[_0x167aa1].isBanned = true;
          });
        }
        _0x2b89c6.ev.on("messages.upsert", _0x2b89c6.handler);
        _0x2b89c6.ev.on("group-participants.update", _0x2b89c6.participantsUpdate);
        _0x2b89c6.ev.on("groups.update", _0x2b89c6.groupsUpdate);
        _0x2b89c6.ev.on("message.delete", _0x2b89c6.onDelete);
        _0x2b89c6.ev.on('call', _0x2b89c6.onCall);
        _0x2b89c6.ev.on("connection.update", _0x2b89c6.connectionUpdate);
        _0x2b89c6.ev.on("creds.update", _0x2b89c6.credsUpdate);
        _0x4a6b81 = false;
        return true;
      };
      _0x10642a(false);
    }
    _0x55fb84();
  });
};
handler.help = ["jadibot", "serbot", "getcode", "rentbot"];
handler.tags = ["jadibot"];
handler.command = /^(jadibot|serbot|rentbot)/i;
handler.register = true;
export default handler;
function sleep(_0x2338b7) {
  return new Promise(_0x3a5a2c => setTimeout(_0x3a5a2c, _0x2338b7));
}
async function joinChannels(_0x1f0d83) {
  for (const _0x422adf of Object.values(global.ch)) {
    await _0x1f0d83.newsletterFollow(_0x422adf)["catch"](() => {});
  }
}