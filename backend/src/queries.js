const pool = require('./db');

async function getMaterialsByRegion(region) {
  const priceColumn = `price_${region}`;
  const query = `SELECT id, name, category, ${priceColumn} AS price FROM materials ORDER BY id`;
  const { rows } = await pool.query(query);
  return rows;
}

async function getCheapestInCategory(category, region) {
  const priceColumn = `price_${region}`;
  const query = `SELECT id, name, ${priceColumn} AS price FROM materials
                 WHERE category = $1
                 ORDER BY ${priceColumn} ASC
                 LIMIT 1`;
  const { rows } = await pool.query(query, [category]);
  return rows[0];
}

module.exports = { getMaterialsByRegion, getCheapestInCategory };