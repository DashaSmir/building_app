const { applyDiscount, evaluateRetention } = require('../src/pricing');

describe('applyDiscount', () => {
  test('должна применить 5% скидку', () => {
    expect(applyDiscount(1000)).toBe(950);
    expect(applyDiscount(860)).toBe(817);
  });
  test('должна корректно округлять', () => {
    expect(applyDiscount(100)).toBe(95);
    expect(applyDiscount(101)).toBe(95.95);
  });
});

describe('evaluateRetention', () => {
  const cheapProduct = { id: 1, name: 'Дешёвый товар', price: '100.00' };
  test('возвращает действие discount, если текущий товар самый дешёвый', () => {
    const result = evaluateRetention(100, 100, cheapProduct);
    expect(result.action).toBe('discount');
    expect(result.newPrice).toBe(95);
  });

  test('возвращает действие replace с предложением, если есть более дешёвый аналог', () => {
    const result = evaluateRetention(150, 100, cheapProduct);
    expect(result.action).toBe('replace');
    expect(result.suggestion.price).toBe(100);
    expect(result.suggestion.product.name).toBe('Дешёвый товар');
  });
});