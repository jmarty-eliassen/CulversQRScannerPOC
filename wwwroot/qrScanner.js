window.qrScanner = {
    mediaStream: null,
    video: null,
    detector: null,
    scanTimer: null,

    async startScanner() {
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('Camera access is not supported by this browser.');
        }

        this.video = document.getElementById('qr-video');
        if (!this.video) {
            throw new Error('Video element not found.');
        }

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            this.mediaStream = stream;
            this.video.srcObject = stream;
            this.video.hidden = false;
            await this.video.play();
        } catch (err) {
            this.stopScanner();
            throw new Error('Unable to access the camera. ' + err?.message);
        }

        const useBarcodeDetector = 'BarcodeDetector' in window;
        if (useBarcodeDetector) {
            const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
            if (!supportedFormats.includes('qr_code')) {
                this.stopScanner();
                throw new Error('QR code scanning is not supported on this device.');
            }

            this.detector = new BarcodeDetector({ formats: ['qr_code'] });

            return new Promise((resolve, reject) => {
                let attempts = 0;
                const scanFrame = async () => {
                    try {
                        const barcodes = await this.detector.detect(this.video);
                        if (barcodes?.length > 0) {
                            const result = barcodes[0]?.rawValue ?? '';
                            this.stopScanner();
                            resolve(result);
                            return;
                        }
                    } catch (error) {
                        console.warn('Barcode detection failed', error);
                    }

                    attempts += 1;
                    if (attempts >= 100) {
                        this.stopScanner();
                        resolve('');
                        return;
                    }

                    this.scanTimer = window.setTimeout(scanFrame, 300);
                };

                scanFrame();
            });
        }

        if (typeof ZXing === 'undefined' || typeof ZXing.BrowserQRCodeReader === 'undefined') {
            this.stopScanner();
            throw new Error('The browser does not support the Barcode Detector API, and no fallback library is available.');
        }

        const codeReader = new ZXing.BrowserQRCodeReader();

        return codeReader.decodeOnceFromVideoDevice(null, this.video)
            .then(result => {
                this.stopScanner();
                return result.text || '';
            })
            .catch(err => {
                this.stopScanner();
                if (err && err.name === 'NotFoundException') {
                    return '';
                }
                throw err;
            });
    },

    stopScanner() {
        if (this.scanTimer) {
            clearTimeout(this.scanTimer);
            this.scanTimer = null;
        }

        if (this.video) {
            this.video.hidden = true;
            this.video.pause();
            this.video.srcObject = null;
            this.video = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        this.detector = null;
    }
};
