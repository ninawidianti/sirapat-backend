const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inisialisasi client dengan LocalAuth agar tidak perlu scan QR terus-menerus setiap server restart
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './wa-session' // Folder lokal penyimpanan sesi
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Event saat QR Code perlu di-scan
client.on('qr', (qr) => {
    console.log('\n--- SCAN QR CODE DI BAWAH DENGAN WHATSAPP ---');
    qrcode.generate(qr, { small: true });
});

// Event saat WhatsApp berhasil terhubung
client.on('ready', () => {
    console.log('✅ Client WhatsApp siap digunakan!');
});

client.on('authenticated', () => {
    console.log('🔑 Otentikasi WhatsApp berhasil.');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Otentikasi gagal:', msg);
});

client.initialize();

/**
 * Fungsi helper untuk format nomor HP ke format ID WhatsApp (62xxx@c.us)
 */
const formatPhoneNumber = (phone) => {
    let cleaned = phone.replace(/\D/g, ''); // Hapus karakter selain angka
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    }
    return `${cleaned}@c.us`;
};

/**
 * Fungsi untuk mengirim notifikasi/notulensi rapat
 */
const sendMeetingNotification = async (targetPhone, meetingData) => {
    try {
        const formattedTarget = formatPhoneNumber(targetPhone);
        
        const message = `📋 *NOTULENSI / PENGINGAT RAPAT*\n` +
                        `----------------------------------------\n` +
                        `📌 *Judul:* ${meetingData.title}\n` +
                        `📅 *Tanggal:* ${meetingData.date}\n` +
                        `🕒 *Waktu:* ${meetingData.time}\n` +
                        `📝 *Notulensi/Ringkasan:*\n${meetingData.summary}\n\n` +
                        `Pesan ini dikirim otomatis oleh Sistem Notulensi Rapat.`;

        const response = await client.sendMessage(formattedTarget, message);
        return { success: true, response };
    } catch (error) {
        console.error('Gagal mengirim WhatsApp:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendMeetingNotification };