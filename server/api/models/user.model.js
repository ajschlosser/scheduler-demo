const {
  uuid4,
  getRandomArrItem
} = require('../../util.js');

class User {
  constructor(options = {
    time_zone: 'America/Los_Angeles',
    // The following values are in UTC
    workDayStart: 16,  // 9 AM
    workDayEnd: 1,     // 5 PM
    workWeekStart: 1,  // Monday
    workWeekEnd: 5,    // Friday
    active: 1,
    events: []
  }) {
    Object.keys(options).forEach(k => this[k] = options[k] !== undefined ? options[k] : undefined);
    this.user_id = uuid4();
    if (!this.name)
    {
      let names = [
        'Grumbo', 'Bumpkin', 'Bopp', 'Gilbert', 'Sandy',
        'Popple', 'Jolly', 'Wilco', 'Bobbles', 'Aurora',
        'Potato', 'Nutmeg', 'Pastry', 'Holly', 'Lupp'
      ];
      this.name = `${getRandomArrItem(names)} ${getRandomArrItem(names)}`;
    }
  }
}

const generateFakeUsers = ({ count = 0, overrides = [], devId = true }) => {
  let dummyUsers = [];
  while (dummyUsers.length < count) {
    let user = new User();
    // In dev, for convenience, use simple integers rather than uuids
    // for user_id (makes debugging simpler)
    if (devId)

      user.user_id = dummyUsers.length + 1;

    if (overrides.length)
    {
      let override = overrides.shift();
      user = { ...user, ...override };
    }
    dummyUsers.push(user);
  }
  return dummyUsers;
};

module.exports = {
  User,
  generateFakeUsers
};
