const crypto = require('crypto');
const { execFileSync } = require('child_process');
const path = require('path');
const db = require(path.join(__dirname, './db'));
const { dayjs } = require('./util');
const { generateFakeUsers } = require('./api/models/user.model');
const { generateFakeEvents } = require('./api/models/event.model');

// Inititalizes everything for development purposes
// * Drops existing database and creates new fresh one
// * Adds fake data (users, events, auth, etc.)
// * Returns a promise
const init = async function () {
  console.log(process.env.SCHEDULER_DEMO_ENVIRONMENT);
  if (process.env.SCHEDULER_DEMO_ENVIRONMENT !== undefined)
    return

  try
  {
    console.log('initializing database');
    execFileSync(path.join(__dirname, './init-db.sh'));
    console.log('database initialization complete');
    console.log('mysql database driver connected to MySQL server');
    let fakeUsers = generateFakeUsers({ count: 5, overrides: [{ workWeekEnd: 4, time_zone: 'America/Chicago' }]});
    fakeUsers.forEach(async u => {
      try
      {
        await db.query(`INSERT INTO user (user_id, name, workDayStart, workDayEnd, workWeekStart, workWeekEnd, time_zone, active) VALUES ('${u.user_id}', '${u.name}', ${u.workDayStart}, ${u.workDayEnd}, ${u.workWeekStart}, ${u.workWeekEnd}, '${u.time_zone}', 1)`);
        let username = u.name.replace(' ', '').toLowerCase();
        let salt = crypto.randomBytes(128).toString('base64');
        let password = 'Test123!';
        let hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        await db.query(`INSERT INTO auth (user_id, username, password_hash, password_salt) VALUES ('${u.user_id}', '${username}', '${hash.digest('hex')}', '${salt}')`);
        let fakeEvents = generateFakeEvents({ count: 2, dates: ['2020-10-10','2020-10-11','2020-10-12','2020-10-13','2020-10-14','2020-10-15','2020-10-16','2020-10-17','2020-10-18'], time_zone: u.time_zone});
        fakeEvents.forEach(async e => {
          try
          {
            await db.query(`INSERT INTO event (event_id, title, description, md5, start, end, allDay, users) VALUES ('${e.event_id}', '${e.title}', '${e.description}', '${e.md5}', '${dayjs.utc(e.start).format('YYYY-MM-DD HH:mm:ss')}', '${e.end.format('YYYY-MM-DD HH:mm:ss')}', ${e.allDay ? 1: 0}, '${!e.users ? u.user_id : e.users.join(',')}')`);
            await db.query(`INSERT INTO event_user (event_id, user_id, start, end, md5_range) VALUES ('${e.event_id}', '${u.user_id}', '${e.start.format('YYYY-MM-DD HH:mm:ss')}', '${e.start.format('YYYY-MM-DD HH:mm:ss')}', '${e.md5}')`);
          }
          catch (e)
          {
            console.log(e);
            reject(e);
          }
        });
      }
      catch (err)
      {
        console.log(err);
        reject(err);
      }
    });
    resolve();
  }
  catch (err)
  {
    console.log(err);
    reject(err);
  }
};

module.exports = init;