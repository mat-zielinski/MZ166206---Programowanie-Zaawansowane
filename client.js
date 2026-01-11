const net = require('net');
const readline = require('readline');

const SERVER_PORT = 5000;
const SERVER_HOST = '127.0.0.1';
const MY_ID = Math.floor(Math.random() * 1000);

// --auto do testów
const IS_AUTO = process.argv.includes('--auto');

const client = new net.Socket();
let currentRequest = "";

console.log(`[KLIENT #${MY_ID}] Łączę...`);

client.connect(SERVER_PORT, SERVER_HOST, () => { });

client.on('data', (data) => {
    const responseStr = data.toString().trim();

    try {
        const responseObj = JSON.parse(responseStr);

        // Status połączenia
        if (responseObj.status) {
            if (responseObj.status === 'REFUSED') {
                console.log(`[KLIENT #${MY_ID}] Serwer pełny (REFUSED).`);
                client.destroy();
                process.exit(0);
            }
            if (responseObj.status === 'OK') {
                console.log(`[KLIENT #${MY_ID}] Jest OK.`);
                startWork();
            }
            return;
        }

        // Wyniki
        if (Array.isArray(responseObj)) {
            console.log(`\n[KLIENT #${MY_ID}] Przyszło ${responseObj.length} wyników dla '${currentRequest}':`);

            responseObj.forEach(item => {
                // Sprawdzenie typu (rzutowanie)
                if (item._type !== currentRequest && currentRequest !== 'ANY') {
                    console.error(`   [BŁĄD] ClassCastException! Chciałem '${currentRequest}', dostałem '${item._type}'`);
                } else {
                    if (item.val) console.log(`   -> Temp: ${item.val}°C (${item.city})`);
                    else if (item.speed) console.log(`   -> Wiatr: ${item.speed}km/h (${item.city})`);
                    else console.log(`   -> Inne: ${JSON.stringify(item)}`);
                }
            });

            if (IS_AUTO) nextAutoStep();
            else askUser();
        }

    } catch (e) {
        console.error("Błąd json:", e);
    }
});

client.on('close', () => {
    console.log(`[KLIENT #${MY_ID}] Koniec.`);
    process.exit(0);
});

client.on('error', () => { });

// --- UI ---

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function startWork() {
    if (IS_AUTO) {
        // console.log("Tryb auto...");
        nextAutoStep();
    } else {
        askUser();
    }
}

function askUser() {
    rl.question(`\nPodaj klasę (TempReport, WindReport, GhostObj) lub 'exit': `, (answer) => {
        const cmd = answer.trim();
        if (cmd === 'exit') { client.destroy(); return; }
        if (cmd) {
            currentRequest = cmd;
            client.write(cmd);
        } else {
            askUser();
        }
    });
}

function nextAutoStep() {
    setTimeout(() => {
        // Prosta sekwencja testowa
        if (!currentRequest) {
            currentRequest = 'TempReport';
            client.write('TempReport');
        } else if (currentRequest === 'TempReport') {
            currentRequest = 'WindReport';
            client.write('WindReport');
        } else if (currentRequest === 'WindReport') {
            currentRequest = 'GhostObj'; // Test błędu
            client.write('GhostObj');
        } else {
            client.destroy();
        }
    }, 1000);
}