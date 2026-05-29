const { getMaterialsByRegion, getCheapestInCategory } = require('../src/queries');
const pool = require('../src/db');
jest.mock('../src/db');

describe('getMaterialsByRegion', () => {
  test('возвращает материалы для указанного региона', async () => {
    const fakeRows = [
      { id: 1, name: 'Товар 1', category: 'Кат', price: '100.00' },
      { id: 2, name: 'Товар 2', category: 'Кат', price: '200.00' },
    ];
    pool.query.mockResolvedValue({ rows: fakeRows });
    const result = await getMaterialsByRegion('spb');
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('price_spb'));
    expect(result).toEqual(fakeRows);
  });
});

describe('getCheapestInCategory', () => {
  test('возвращает самый дешёвый товар в категории', async () => {
    const fakeCheapest = { id: 3, name: 'Дешёвый', price: '50.00' };
    pool.query.mockResolvedValue({ rows: [fakeCheapest] });
    const result = await getCheapestInCategory('Утеплитель', 'msk');
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('price_msk'), ['Утеплитель']);
    expect(result).toEqual(fakeCheapest);
  });
});