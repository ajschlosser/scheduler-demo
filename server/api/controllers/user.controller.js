const db = require('../../db');
const { catchHandler } = require('../../util');

const mapUsers = user => {
  let events = user.events ? user.events.split(',') : [];
  return {
    ...user,
    events,
    working_hours: `${user.workDayStart}:00-${user.workDayEnd}:00`
  };
};

const getUsers = async idStrOrArr => {
  if (idStrOrArr && typeof idStrOrArr === 'string')

    idStrOrArr = `'${idStrOrArr.split(',').join('\',\'')}'`;

  let whereClause = !idStrOrArr ? '' : 'WHERE u.user_id IN (' + idStrOrArr + ')';
  let q = `SELECT u.user_id, ANY_VALUE(u.name) AS name, ANY_VALUE(u.workDayStart) AS workDayStart, ANY_VALUE(u.workDayEnd) AS workDayEnd, ANY_VALUE(u.workWeekStart) AS workWeekStart, ANY_VALUE(u.workWeekEnd) AS workWeekEnd, ANY_VALUE(u.time_zone) AS time_zone, ANY_VALUE(u.active) AS active, GROUP_CONCAT(eu.event_id SEPARATOR ',') AS events FROM user u LEFT JOIN event_user eu ON eu.user_id = u.user_id ${whereClause} GROUP BY u.user_id`;
  try
  {
    let rows = await db.query(q);
    return rows.map(mapUsers);
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const createUser = async userObj => {
  let q = `INSERT INTO user (user_id, name, workDayStart, workDayEnd, workWeekStart, workWeekEnd, time_zone, active) VALUES ('${userObj.user_id}','${userObj.name}','${userObj.workDayStart}','${userObj.workDayEnd}','${userObj.workWeekStart}','${userObj.workWeekEnd}','${userObj.time_zone}','${userObj.active}')`;
  try
  {
    return await db.query(q);
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const updateUserById = async (user_id, data) => {
  let q = 'UPDATE user ';
  Object.keys(data).forEach((k, i, kArr) => {
    if (i === 0)
      q += 'SET ';
    q += `${k} = '${data[k]}'`;
    if (i !== kArr.length - 1)
      q += ', ';
  });
  q += ` WHERE user_id = '${user_id}'`;
  try
  {
    const userResult = await db.query(q);
    if (userResult.affectedRows === 0)
      throw 404;
    else
      return userResult;
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const deleteUserById = async user_id => {
  let q = `DELETE FROM user WHERE user_id = '${user_id}'`;
  try
  {
    const userResult = await db.query(q);
    if (userResult.affectedRows === 0)
      throw 404;
    else
      return userResult;
  }
  catch (err)
  {
    catchHandler(err);
  }
};

const getUserById = async id => getUsers(id);

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById
};
