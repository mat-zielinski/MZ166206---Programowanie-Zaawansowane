const net = require('net');

class TempReport {
    constructor(id, val, city) {
        this._type = 'TempReport';
        this.id = id;
        this.val = val;
        this.city = city;
    }
    toString() { return `TempReport [ID:${this.id}, ${this.city}, ${this.val}°C]`; }
    equals(other) { return other instanceof TempReport && this.id === other.id; }
}

class WindReport {
    constructor(id, speed, city) {
        this._type = 'WindReport';
        this.id = id;
        this.speed = speed;
        this.city = city;
    }
    toString() { return `WindReport [ID:${this.id}, ${this.city}, ${this.speed}km/h]`; }
    equals(other) { return other instanceof WindReport && this.id === other.id; }
}

// Do testowania błędów rzutowania (inny typ obiektu)
class StatusReport {
    constructor(id, msg) {
        this._type = 'StatusReport';
        this.id = id;
        this.msg = msg;
    }
    toString() { return `StatusReport [${this.msg}]`; }
}

const MAX_CLIENTS = 2;
let activeClients = 0;
const dataMap = new Map();

// 4 miasta wystarczą do spełnienia wymagań
const CITIES = ["Warszawa", "Kraków", "Gdańsk", "Wrocław"];

function initData() {
    console.log(">> [SERVER] Generuję dane...");

    let tempCount = 0;
    let windCount = 0;

    CITIES.forEach((city) => {
        // Po 2 obiekty na miasto
        for (let j = 0; j < 2; j++) {
            const temp = new TempReport(++tempCount, (10 + Math.random() * 20).toFixed(1), city);
            const wind = new WindReport(++windCount, Math.floor(Math.random() * 50), city);

            // Klucz: NazwaKlasy_Index
            dataMap.set(`TempReport_${tempCount}`, temp);
            dataMap.set(`WindReport_${windCount}`, wind);
        }
    });

    dataMap.set('StatusReport_1', new StatusReport(1, "System OK"));
    console.log(`>> [SERVER] Gotowe (obiektów: ${dataMap.size})`);
}

initData();

const server = net.createServer((socket) => {
    if (activeClients >= MAX_CLIENTS) {
        console.log(`>> Limit klientów (${MAX_CLIENTS}) osiągnięty.`);
        socket.write(JSON.stringify({ status: 'REFUSED' }));
        socket.end();
        return;
    }

    activeClients++;
    const clientId = socket.remotePort;
    console.log(`>> [KLIENT #${clientId}] Połączono.`);

    socket.write(JSON.stringify({ status: 'OK' }) + '\n');

    socket.on('data', (data) => {
        // Losowe opóźnienie 0.5 - 1.5s
        const delay = Math.floor(Math.random() * 1000) + 500;

        setTimeout(() => {
            try {
                const requestType = data.toString().trim();
                console.log(`>> [KLIENT #${clientId}] Pyta o: '${requestType}'`);

                const responseList = [];
                let foundAny = false;

                for (const [key, value] of dataMap.entries()) {
                    if (key.startsWith(requestType + "_")) {
                        responseList.push(value);
                        foundAny = true;
                    }
                }

                if (foundAny) {
                    socket.write(JSON.stringify(responseList) + '\n');
                    console.log(`    -> Wysłano ${responseList.length} sztuk.`);
                } else {
                    // Jak nie ma, wyślij cokolwiek żeby klient rzucił błędem
                    console.log(`    -> Nie ma takiej klasy, wysyłam fake object.`);
                    const fakeList = [new StatusReport(999, "Fake Object")];
                    socket.write(JSON.stringify(fakeList) + '\n');
                }

            } catch (e) {
                console.error("Błąd:", e);
            }
        }, delay);
    });

    socket.on('end', () => {
        activeClients--;
        console.log(`>> [KLIENT #${clientId}] Rozłączono.`);
    });

    socket.on('error', (err) => {
        activeClients--;
    });
});

server.listen(5000, () => {
    console.log(">> Serwer działa na porcie 5000");
});