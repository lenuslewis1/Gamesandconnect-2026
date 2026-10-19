// Currency amounts are compared in pesewas to avoid floating-point boundaries.
export function chosenPayment(value, total) {
    const text = String(value).trim();
    if (!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(text)) return null;
    const amountInPesewas = Math.round(Number(text) * 100);
    const totalInPesewas = Math.round(Number(total) * 100);
    if (!Number.isSafeInteger(amountInPesewas) || !Number.isSafeInteger(totalInPesewas)
        || amountInPesewas < 1 || amountInPesewas > totalInPesewas) return null;
    return { amount: amountInPesewas / 100, balance: (totalInPesewas - amountInPesewas) / 100 };
}
