define(['../../vendors/getify/npo'], function (NativePromise) {
    'use strict';
    const base64 = () => ({
        title: 'Base64',
        name: 'base64',
        uploadFile(file, fileName) {
            const reader = new FileReader();
            return new NativePromise((resolve, reject) => {
                reader.onload = event => {
                    const url = event.target.result;
                    resolve({
                        storage: 'base64',
                        name: fileName,
                        url: url,
                        size: file.size,
                        type: file.type
                    });
                };
                reader.onerror = () => {
                    return reject(this);
                };
                reader.readAsDataURL(file);
            });
        },
        downloadFile(file) {
            return NativePromise.resolve(file);
        }
    });
    base64.title = 'Base64';
    return base64;
});