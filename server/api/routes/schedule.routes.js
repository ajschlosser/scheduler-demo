const express = require('express');
const scheduleRouter = express.Router();
const { getUsers } = require('../controllers/user.controller');
const { compareSchedules } = require('../controllers/schedule.controller');

// Given a range and a set of user_ids, find all free and busy periods
// * Gets user data from database
// * Gets all events associated with said users
// * Merges all overlapping event intervals into busy blocks
// * Creates free blocks out of the remaining gaps
// * If work hours are considered, adjusts accordingly per each user's work schedule
scheduleRouter.get('/', async (req, res, next) => {
  if (!req.query.start || !req.query.end || !req.query.id) return next(400);
  try
  {
    const users = await getUsers(req.query.id);
    let schedule = await compareSchedules(
      users,
      req.query.start,
      req.query.end,
      req.query.time_zone,
      req.query.workSchedule === 'true' ? true : false
    );
    res.json(schedule);
  }
  catch (err)
  {
    next(err);
  }
});

module.exports = scheduleRouter;