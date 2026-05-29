const inquirer = require('inquirer');
const { getMaterialsByRegion, getCheapestInCategory } = require('./queries');
const fs = require('fs');
const path = require('path');

const regionMap = {
  'Санкт-Петербург': 'spb',
  'Москва': 'msk',
  'Краснодар': 'krd',
};

async function main() {
  try {
    const { regionName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'regionName',
        message: 'Выберите регион:',
        choices: Object.keys(regionMap),
      },
    ]);
    const region = regionMap[regionName];
    const materials = await getMaterialsByRegion(region);
    const { materialId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'materialId',
        message: 'Выберите товар:',
        choices: materials.map((m) => ({
          name: `${m.name} — ${m.price} руб.`,
          value: m.id,
        })),
      },
    ]);
    const selectedMaterial = materials.find((m) => m.id === materialId);
    let currentOffer = {
      product: selectedMaterial,
      price: parseFloat(selectedMaterial.price),
    };
    console.log('\nВаш текущий заказ:');
    console.log(`Товар: ${currentOffer.product.name}`);
    console.log(`Категория: ${currentOffer.product.category}`);
    console.log(`Регион: ${regionName}`);
    console.log(`Цена: ${currentOffer.price} руб.`);
    let needConfirm = true;
    while (needConfirm) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Оформляем заявку?',
          default: true,
        },
      ]);

      if (confirm) {
        const order = {
          date: new Date().toISOString(),
          region: regionName,
          product: currentOffer.product.name,
          category: currentOffer.product.category,
          price: currentOffer.price,
        };
        // const fileName = `order_${Date.now()}.json`;
        const fileName = `orders/order_${Date.now()}.json`;
        fs.writeFileSync(fileName, JSON.stringify(order, null, 2), 'utf-8');
        console.log(`\nЗаявка сохранена в файл: ${fileName}`);
        needConfirm = false;
      } else {
        const category = currentOffer.product.category;
        const cheapest = await getCheapestInCategory(category, region);
        const cheapestPrice = parseFloat(cheapest.price);

        if (currentOffer.price === cheapestPrice) {
          const discounted = Math.round(currentOffer.price * 0.95 * 100) / 100;
          console.log(`\nВы выбрали самый доступный товар в категории "${category}".`);
          console.log(`Мы можем предложить вам скидку 5%: ${discounted} руб.`);
          const { acceptDiscount } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'acceptDiscount',
              message: 'Применить скидку и оформить заявку?',
              default: true,
            },
          ]);
          if (acceptDiscount) {
            currentOffer.price = discounted;
            console.log(`Новая цена: ${currentOffer.price} руб.`);
          }
        } else {
          console.log(`\nВ категории "${category}" есть более дешёвый аналог:`);
          console.log(`${cheapest.name} — ${cheapestPrice} руб.`);
          const { replace } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'replace',
              message: 'Заменить товар на более дешёвый?',
              default: true,
            },
          ]);
          if (replace) {
            currentOffer = {
              product: { ...cheapest, category },
              price: cheapestPrice,
            };
            console.log(`\nТовар заменён. Новый заказ:`);
            console.log(`Товар: ${currentOffer.product.name}`);
            console.log(`Цена: ${currentOffer.price} руб.`);
          }
        }
      }
    }
    console.log('Работа приложения завершена.');
    process.exit(0);
  } catch (error) {
    console.error('Произошла ошибка:', error);
    process.exit(1);
  }
}

main();