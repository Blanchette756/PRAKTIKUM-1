export function ringkasInventaris(data) {
    if (!Array.isArray(data)) {
        throw new TypeError('Data harus berupa array');
    }

    return {
        jenisAlat: data.length,
        totalUnit: data.reduce((sum, item) => sum + item.jumlah, 0),
        perluCek: data.filter(item => item.kondisi !== 'Baik').length
    };
}