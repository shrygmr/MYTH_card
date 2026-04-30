const fs = require('fs');

function generatePin() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like 0, O, 1, I
    let pin = '';
    for (let i = 0; i < 4; i++) {
        pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pin += '-';
    for (let i = 0; i < 2; i++) {
        pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pin;
}

const pins = new Set();
while (pins.size < 1000) {
    pins.add(generatePin());
}

const pinList = Array.from(pins);
fs.writeFileSync('student_pins.json', JSON.stringify(pinList, null, 2));
console.log('1000 unique PINs generated in student_pins.json');
