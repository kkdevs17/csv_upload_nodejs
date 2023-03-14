const express = require('express');
const app = express();

const fs = require('fs');
const csv = require('csv-parser');

const {default: axios} = require('axios');

const {v4: uuid} = require('uuid');

let index = 1;

const recursive = async (data, startIndex, endIndex) => {
  await Promise.all(
    data.slice(startIndex, endIndex).map(async dataItem => {
      const player_id = dataItem.player_id;
      const body = {
        app_id: '9795a90d-b6b7-4f5f-83d6-b2773f338c6e',
        external_user_id: uuid(),
      };
      const url = `https://onesignal.com/api/v1/players/${player_id}`;
      try {
        const response = await axios.put(url, body);
        console.log(index++, response.data);
      } catch (error) {
        console.log(error);
      }
    }),
  );

  if (endIndex < data.length) {
    startIndex = endIndex;
    endIndex = endIndex + 500 > data.length ? data.length : endIndex + 500;
    recursive(data, startIndex, endIndex);
  }
};

app.get('/', async (_req, res) => {
  const results = [];

  fs.createReadStream('./users_export.csv')
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', async () => {
      const data = results.filter(
        dataItem => !dataItem.external_user_id && dataItem,
      );

      const endIndex = data.length < 500 ? data.length : 500;
      await recursive(data, 0, endIndex);

      res.send('End');
    });
});

app.listen(4000, () => {
  console.log('Stated');
});
