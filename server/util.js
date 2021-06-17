const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(timezone);

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const uuid4 = () => {
  var rnd = crypto.randomBytes(16);
  rnd[6] = (rnd[6] & 0x0f) | 0x40;
  rnd[8] = (rnd[8] & 0x3f) | 0x80;
  rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
  rnd.shift();
  return rnd.join('-');
};
uuid4.valid = uuid => uuidPattern.test(uuid);

const getResponseHandler = r => {
  if (!r)

    throw 500;

  else if (!r.length)

    throw 404;

  return r;
};


const catchHandler = err => {
  console.log(err);
  throw err;
};

const errorHandler = (err, req, res) => {
  console.log('Error:', err);
  if (err.statusCode && Number.isInteger(err.StatusCode))

    err = err.StatusCode;

  else if (err.status && Number.isInteger(err.status))

    err = err.status;

  else if (err.code && err.sqlMessage)

    switch (err.code)
    {
      case 'ER_BAD_FIELD_ERROR':
      case 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD':
        err = 400;
        break;
    }

  res.sendStatus(Number.isInteger(err) ? err : 500);
};

const sortRangesBy = (events, sortBy) => {
  function dayify(obj) {
    if (typeof obj[sortBy] === 'string')

      obj[sortBy] = dayjs.utc(obj[sortBy]).startOf('day');

    return obj[sortBy];
  }
  return [...events].sort((a, b) => {
    a = dayify(a);
    b = dayify(b);
    if (a.isBefore(b)) return sortBy === 'start' ? -1 : 1;
    if (a.isAfter(b)) return sortBy === 'start' ? 1 : -1;
    if (a.isSame(b)) return 0;
  });
};

const getEnvVarsFromFile = filePath => {
  const fileLocation = path.resolve(filePath);
  if (fs.existsSync(fileLocation))
  {
    const lines = fs.readFileSync(fileLocation, 'utf8').split('\n');
    for (let l of lines)
    {
      if (l[0] === '#' || !l.length) continue;
      const pair = l.split('=');
      if (pair.length === 2 && pair[1].length)

        process.env[pair[0]] = pair[1];

    }
  }
  else

    throw new Error(`dotenv file not found: ${filePath}`);

  return process.env;
};

const rand = (n1, n2) => n2 ? n1 + Math.floor(Math.random() * (n2 - n1)) : Math.floor(Math.random() * n1);
const getRandomArrItem = arr => arr[rand(0, arr.length)];

module.exports = {
  dayjs,
  catchHandler,
  errorHandler,
  getEnvVarsFromFile,
  getRandomArrItem,
  getResponseHandler,
  rand,
  sortRangesBy,
  uuid4
};
