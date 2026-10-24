import QRCode from 'qrcode';

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 256,
      color: {
        dark: '#0B0510',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('QR code generation error:', err);
    return '';
  }
}

export function buildVerificationUrl(certId: string, hash?: string): string {
  const origin = window.location.origin;
  const params = new URLSearchParams();
  params.set('id', certId);
  if (hash) params.set('hash', hash);
  return `${origin}/?${params.toString()}`;
}
