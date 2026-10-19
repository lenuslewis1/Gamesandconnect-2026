import test from 'node:test';
import assert from 'node:assert/strict';
import { chosenPayment } from '../src/legacy/lib/chosenPayment.mjs';

test('accepts amounts below the former 50 percent minimum', () => {
    assert.deepEqual(chosenPayment('10', 1500), { amount: 10, balance: 1490 });
    assert.deepEqual(chosenPayment('0.01', 1500), { amount: 0.01, balance: 1499.99 });
});
test('accepts full payment and calculates decimal balances exactly', () => {
    assert.deepEqual(chosenPayment('100.25', 100.25), { amount: 100.25, balance: 0 });
    assert.deepEqual(chosenPayment('0.10', 0.30), { amount: 0.1, balance: 0.2 });
    assert.deepEqual(chosenPayment('100.24', 100.25), { amount: 100.24, balance: 0.01 });
});
test('rejects zero, negatives, overpayment, non-currency and excess precision', () => {
    for (const value of ['', '0', '-1', '100.26', '0.001', '1.999', 'Infinity', 'NaN', '1e2', '10abc']) {
        assert.equal(chosenPayment(value, 100.25), null, value);
    }
});
test('revalidates the amount after ticket count or tier total changes', () => {
    assert.deepEqual(chosenPayment('150', 200), { amount: 150, balance: 50 });
    assert.equal(chosenPayment('150', 100), null);
    assert.equal(chosenPayment('1', 0), null);
});
