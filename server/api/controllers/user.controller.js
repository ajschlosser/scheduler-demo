const db = require('../../db');

const mapUsers = user => {
  let events = user.events ? user.events.split(',') : [];
  return {
    ...user,
    events,
    working_hours: `${user.workDayStart}:00-${user.workDayEnd}:00`
  }
}

const getUsers = async idStrOrArr => {
  if (idStrOrArr && typeof idStrOrArr === 'string')
  {
    idStrOrArr = `'${idStrOrArr.split(',').join('\',\'')}'`;
  }
  let whereClause = !idStrOrArr ? '' : 'WHERE u.user_id IN (' + idStrOrArr + ')';
  let q = `SELECT u.user_id, ANY_VALUE(u.name) AS name, ANY_VALUE(u.workDayStart) AS workDayStart, ANY_VALUE(u.workDayEnd) AS workDayEnd, ANY_VALUE(u.workWeekStart) AS workWeekStart, ANY_VALUE(u.workWeekEnd) AS workWeekEnd, ANY_VALUE(u.time_zone) AS time_zone, ANY_VALUE(u.active) AS active, GROUP_CONCAT(eu.event_id SEPARATOR ',') AS events FROM user u LEFT JOIN event_user eu ON eu.user_id = u.user_id ${whereClause} GROUP BY u.user_id`
  try
  {
    let rows = await db.query(q);
    console.log(rows);
    return rows;
  }
  catch (err)
  {
    throw err;
  }
};

const createUser = userObj => {
  return new Promise((resolve, reject) => {
    let q = `INSERT INTO user (user_id, name, workDayStart, workDayEnd, workWeekStart, workWeekEnd, time_zone, active) VALUES ('${userObj.user_id}','${userObj.name}','${userObj.workDayStart}','${userObj.workDayEnd}','${userObj.workWeekStart}','${userObj.workWeekEnd}','${userObj.time_zone}','${userObj.active}')`;
    db.query(q)
      .then(r => {
        resolve(r);
      })
      .catch(err => reject(err));
  });
};

const updateUserById = (user_id, data) => {
  return new Promise((resolve, reject) => {
    let q = `UPDATE user `;
    Object.keys(data).forEach((k, i, kArr) => {
      if (i === 0)
      {
        q += `SET `;
      }
      q += `${k} = '${data[k]}'`;
      if (i !== kArr.length-1)
      {
        q += `, `;
      }
    });
    q += ` WHERE user_id = '${user_id}'`
    db.query(q)
      .then(r => {
        console.log(r);
        if (r.affectedRows === 0)
        {
          reject(404);
        }
        else
        {
          resolve(r);
        }
      })
      .catch(err => reject(err));
  });
};

const deleteUserById = user_id => {
  return new Promise((resolve, reject) => {
    let q = `DELETE FROM user WHERE user_id = '${user_id}'`;
    db.query(q)
      .then(r => {
        if (r.affectedRows === 0)
        {
          reject(404);
        }
        else
        {
          resolve(r);
        }
      })
      .catch(err => reject(err));
  });
}

const getUserById = id => getUsers(id);

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById
};