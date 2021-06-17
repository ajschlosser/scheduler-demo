const db = require('../../db');
const {
  catchHandler,
  dayjs,
  sortRangesBy
} = require('../../util');

const iso8601format = 'YYYY-MM-DD HH:mm:ss';

const mapEvents = e => ({
  ...e,
  start: dayjs.utc(e.start),
  end: dayjs.utc(e.end)
});

const createEvent = async eventObj => {
  let q = `INSERT INTO event (event_id, title, description, md5, start, end, allDay, users, active) VALUES ('${eventObj.event_id}','${eventObj.title}','${eventObj.description}','${eventObj.md5}','${eventObj.start.format(iso8601format)}','${eventObj.end.format(iso8601format)}','${eventObj.allDay ? 1 : 0}', '${eventObj.users ? eventObj.users.join(',') : null}','${eventObj.active}')`;
  try
  {
    return await db.query(q);
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const getEventById = async event_id => {
  let q = `SELECT * FROM event WHERE event_id = '${event_id}'`;
  try
  {
    const rows = await db.query(q);
    return rows.map(mapEvents);
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const getEventsInRange = async (start, end) => {
  start = dayjs.utc(start).startOf('day').format(iso8601format);
  end = dayjs.utc(end).endOf('day').format(iso8601format);
  let q = `SELECT * FROM event WHERE start >= '${start}' AND end <= '${end}'`;
  try
  {
    const rows = await db.query(q);
    return rows.map(mapEvents);
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const updateEventById = async (event_id, data) => {
  //console.log('data',data);
  let q = 'UPDATE event ';
  Object.keys(data).forEach((k, i, kArr) => {
    if (i === 0)
      q += 'SET ';
    q += `${k} = '${data[k]}'`;
    if (i !== kArr.length - 1)
      q += ', ';
  });
  q += ` WHERE event_id = '${event_id}'`;
  try
  {
    const eventResult = await db.query(q);
    if (eventResult.affectedRows === 0)
      throw 404;
    else
      return eventResult;
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const deleteEventById = async event_id => {
  try
  {
    const eventDeleteQuery = `DELETE FROM event WHERE event_id = '${event_id}'`;
    const eventUserDeleteQuery = `DELETE FROM event_user WHERE event_id = '${event_id}'`;
    await db.query(eventDeleteQuery);
    const eventUserResult = await db.query(eventUserDeleteQuery);
    if (eventUserResult.affectedRows === 0)
      throw 404;
    else
      return eventUserResult;
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const getUserEvents = async ({ id, range = {}, orderBy = 'start' }) => {
  if (Array.isArray(id))
    id = `'${id.join('\',\'')}'`;
  let { start, end } = range;
  let rangeClause = '';
  if (start && end)
    rangeClause = `AND eu.start >= '${dayjs.utc(start).format()}' AND eu.end <= '${dayjs.utc(end).format()}'`;
  let q = `SELECT eu.user_id AS user_id, u.name AS attendee_name, u.time_zone AS attendee_time_zone, e.* FROM event_user eu LEFT JOIN user u ON u.user_id = eu.user_id LEFT JOIN event e ON e.event_id = eu.event_id WHERE eu.user_id IN (${id}) ${rangeClause} ORDER BY eu.${orderBy}`;
  try {
    const rows = await db.query(q);
    return sortRangesBy(rows.map(mapEvents), orderBy);
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const linkEventToUser = async (event_id, user_id) => {
  let q = `INSERT INTO event_user (user_id, event_id, start, end, md5_range) SELECT u.user_id, '${event_id}', start, end, md5 FROM event LEFT JOIN user u ON u.user_id = '${user_id}' WHERE event_id = '${event_id}' AND u.user_id IS NOT NULL`;
  try
  {
    return await db.query(q);
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const unlinkEventFromUser = async (event_id, user_id) => {
  let q = `DELETE FROM WHERE event_id = '${event_id}' AND user_id = '${user_id}'`;
  try
  {
    return await db.query(q);
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const deleteAllEventUsers = async event_id => {
  let q = `DELETE FROM event_user WHERE event_id = '${event_id}'`;
  try {
    return await db.query(q);
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const updateEventUsers = async (event_id, user_ids) => {
  try
  {
    const deleteResult = await deleteAllEventUsers(event_id);
    let agg = [deleteResult];
    await user_ids.forEach(async user_id => agg.push(await linkEventToUser(event_id, user_id)));
    return agg;
  }
  catch (err)
  {
    catchHandler(err);
  }
};

module.exports = {
  updateEventUsers,
  getEventById,
  getUserEvents,
  getEventsInRange,
  updateEventById,
  deleteEventById,
  createEvent,
  linkEventToUser,
  unlinkEventFromUser
};
