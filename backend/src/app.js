const inquirer = require('inquirer');
const { getMaterialsByRegion, getCheapestInCategory } = require('./queries');
const fs = require('fs');
const regionMap = {
  'Санкт-Петербург': 'spb',
  'Москва': 'msk',
  'Краснодар': 'krd',
};
async function askContinueOrExit() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Что хотите сделать?',
      choices: [
        { name: 'Вернуться к выбору товаров', value: 'menu' },
        { name: 'Завершить программу', value: 'exit' },
      ],
    },
  ]);
  return action;
}

async function main() {
  let exitProgram = false;
  while (!exitProgram) {
    try {
      const { regionName } = await inquirer.prompt([
        {
          type: 'list',
          name: 'regionName',
          message: 'Выберите регион:',
          choices: [...Object.keys(regionMap), 'Выход'],
        },
      ]);

      if (regionName === 'Выход') {
        console.log('До свидания!');
        exitProgram = true;
        continue;
      }

      const region = regionMap[regionName];
      const materials = await getMaterialsByRegion(region);
      let backToRegion = false;
      while (!backToRegion && !exitProgram) {
        const choices = [
          ...materials.map((m) => ({
            name: `${m.name} — ${m.price} руб.`,
            value: m.id,
          })),
          { name: '← Назад (к выбору региона)', value: -1 },
        ];

        const { materialId } = await inquirer.prompt([
          {
            type: 'list',
            name: 'materialId',
            message: 'Выберите товар:',
            choices,
          },
        ]);
        if (materialId === -1) {
          backToRegion = true;
          continue;
        }
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
        let retentionUsed = false;

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
            const fileName = `orders/order_${Date.now()}.json`;
            fs.writeFileSync(fileName, JSON.stringify(order, null, 2), 'utf-8');
            console.log(`\nЗаявка сохранена в файл: ${fileName}`);
            needConfirm = false;
            exitProgram = true;
          } else {
            if (retentionUsed) {
              const action = await askContinueOrExit();
              if (action === 'menu') {
                needConfirm = false;  
              } else {
                console.log('До свидания!');
                needConfirm = false;
                exitProgram = true;
              }
              continue;
            }
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
              } else {
                const action = await askContinueOrExit();
                if (action === 'menu') {
                  needConfirm = false;
                } else {
                  console.log('До свидания!');
                  needConfirm = false;
                  exitProgram = true;
                }
                retentionUsed = true;
                continue;
              }
              retentionUsed = true;
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
              } else {
                console.log('Оставляем первоначальный товар.');
              }
              retentionUsed = true;
            }
          }
        }
      }

    } catch (error) {
      console.error('Произошла ошибка:', error);
      exitProgram = true;
    }
  }

  console.log('Работа приложения завершена.');
  process.exit(0);
}

main();