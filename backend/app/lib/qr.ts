import QRCode from 'qrcode';

// ✅ تولید QR Code با کد تایید
export async function generateQRCodeWithCode(phone: string, code: string) {
  try {
    // اطلاعاتی که توی QR ذخیره میشه
    const qrData = JSON.stringify({
      phone: phone,
      code: code,
      timestamp: Date.now()
    });
    
    // تولید QR Code از اطلاعات
    const qrDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300
    });
    
    return qrDataURL;
  } catch (error) {
    console.error('❌ خطا در تولید QR:', error);
    throw new Error('خطا در تولید QR Code');
  }
}