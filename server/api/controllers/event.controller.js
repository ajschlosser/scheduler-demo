const db = require('../../db');
const {
  dayjs,
  sortRangesBy
} = require('../../util');

const mapEvents = e => {
  return {
    ...e,
    start: dayjs.utc(e.start),
    end: dayjs.utc(e.end)
  };
};

const createEvent = async eventObj => {
  return new Promise((resolve, reject) => {
    let q = `INSERT INTO event (event_id, title, description, md5, start, end, allDay, users, active) VALUES ('${eventObj.event_id}','${eventObj.title}','${eventObj.description}','${eventObj.md5}','${eventObj.start.format('YYYY-MM-DD HH:mm:ss')}','${eventObj.end.format('YYYY-MM-DD HH:mm:ss')}','${eventObj.allDay ? 1 : 0}', '${eventObj.users ? eventObj.users.join(',') : null}','${eventObj.active}')`;
    db.query(q)
      .then(r => {
        resolve(r);
      })
      .catch(err => reject(err));
  });
};

const getEventById = event_id => {
  return new Promise((resolve, reject) => {
    let q = `SELECT * FROM event WHERE event_id = '${event_id}'`;
    db.query(q)
      .then(rows => resolve(rows.map(mapEvents)))
      .catch(err => reject(err));
  });
};

const getEventsInRange = (start, end) => {
  start = dayjs.utc(start).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  end = dayjs.utc(end).endOf('day').format('YYYY-MM-DD HH:mm:ss');
  return new Promise((resolve, reject) => {
    let q = `SELECT * FROM event WHERE start >= '${start}' AND end <= '${end}'`;
    console.log(q);
    db.query(q)
      .then(rows => resolve(rows.map(mapEvents)))
      .catch(err => reject(err));
  });
};

const updateEventById = (event_id, data) => {
  console.log('data',data);
  return new Promise((resolve, reject) => {
    let q = `UPDATE event `;
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
    q += ` WHERE event_id = '${event_id}'`
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
};

const deleteEventById = event_id => {
  return new Promise((resolve, reject) => {
    let q = `DELETE FROM event WHERE event_id = '${event_id}'`;
    db.query(q)
      .then(db.query(`DELETE FROM event_user WHERE event_id = '${event_id}'`))
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

const getUserEvents = ({ id, range={}, orderBy='start' }) => {
  if (Array.isArray(id)) id = `'${id.join('\',\'')}'`;
  let { start, end } = range;
  let rangeClause = '';
  if (start && end)
  {
    rangeClause = `AND eu.start >= '${dayjs.utc(start).format()}' AND eu.end <= '${dayjs.utc(end).format()}'`;
  }
  return new Promise((resolve, reject) => {
    let q = `SELECT eu.user_id AS user_id, u.name AS attendee_name, u.time_zone AS attendee_time_zone, e.* FROM event_user eu LEFT JOIN user u ON u.user_id = eu.user_id LEFT JOIN event e ON e.event_id = eu.event_id WHERE eu.user_id IN (${id}) ${rangeClause} ORDER BY eu.${orderBy}`;
    db.query(q)
      .then(rows => {
        resolve(sortRangesBy(rows.map(mapEvents), orderBy));
      })
      .catch(err => reject(err));
  });
};

const linkEventToUser = (event_id, user_id) => {
  return new Promise((resolve, reject) => {
    let q = `INSERT INTO event_user (user_id, event_id, start, end, md5_range) SELECT u.user_id, '${event_id}', start, end, md5 FROM event LEFT JOIN user u ON u.user_id = '${user_id}' WHERE event_id = '${event_id}' AND u.user_id IS NOT NULL`;
    db.query(q)
      .then(r => {
        resolve(r);
      })
      .catch(err => reject(err));
  });
};

const unlinkEventFromUser = (event_id, user_id) => {
  return new Promise((resolve, reject) => {
    let q = `DELETE FROM WHERE event_id = '${event_id}' AND user_id = '${user_id}'`;
    db.query(q)
      .then(r => {
        resolve(r);
      })
      .catch(err => reject(err));
  });
};

const deleteAllEventUsers = event_id => {
  return new Promise((resolve, reject) => {
    let q = `DELETE FROM event_user WHERE event_id = '${event_id}'`;
    db.query(q)
      .then(r => {
        resolve(r);
      })
      .catch(err => reject(err));
  });  
}

const updateEventUsers = async (event_id, user_ids) => {
  return new Promise((resolve, reject) => {
    deleteAllEventUsers(event_id)
      .then(async r => {
        let agg = [r];
        await user_ids.forEach(async user_id => agg.push(await linkEventToUser(event_id, user_id)) );
        resolve(agg);
      })
      .catch(err => {
        reject(err);
      });
  });

};


module.exports = {
  updateEventUsers,
  getEventById,
  getUserEvents,
  getEventsInRange,
  updateEventById,
  deleteEventById,
  createEvent,
  linkEventToUser
}