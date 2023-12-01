const { DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const makeWASocket = require('@whiskeysockets/baileys').default;
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        auth: state,
    });
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update || {};

        if (qr) {
            console.log("scan QR code", qr);
        }

        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect.error)?.output?.statusCode !==
                DisconnectReason.loggedOut;
            console.log(
                "connection closed due to ",
                lastDisconnect.error,);
            // reconnect if not logged out
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === "open") {
            console.log("opened connection");
        }
    });
    sock.ev.on ('creds.update', saveCreds)
}
connectToWhatsApp();