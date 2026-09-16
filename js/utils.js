export function ringkasMobil(data) {
    if (!Array.isArray(data)) {
        throw new TypeError('Data harus berupa array');
    }

    return {
        jenisMobil: data.length,
        totalUnit: data.reduce((sum, item) => sum + item.jumlah, 0),
        perluServis: data.filter(item => item.kondisi !== 'Baik').length
    };
}