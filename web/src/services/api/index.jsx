import axios from 'axios';

const baseUrl = `http://${window.location.host.split(':')[0]}:3100/api`;

const fetchSchedule = async ({ users, start, end, options }) => {
  try
  {
    let { tz = 'America%2fLos_Angeles', workSchedule = true } = options;
    workSchedule = workSchedule ? 'true' : 'false';
    let ids = users ? users.map(a => a.user_id).join(',') : '';
    let reqUrl = `${baseUrl}/schedule?id=${encodeURIComponent(ids)}&start=${start}&end=${end}&time_zone=${encodeURIComponent(tz)}&workSchedule=${workSchedule}`;
    let r = await axios.get(reqUrl);
    return { events: r.data };
  }
  catch (err)
  {
    console.log(err);
    return [];
  }
};

const fetchUsers = async () => {
  try
  {
    let usersResponse = await axios.get(`${baseUrl}/users`);
    return {
      users: usersResponse.data
    };
  }
  catch (err)
  {
    console.log(err);
    return [];
  }
};

const fetchUserEvents = async ({ user_id, start, end, options }) => {
  try
  {
    let reqUrl = `${baseUrl}/users/${user_id}/events?start=${start}&end=${end}`;
    let r = await axios.get(reqUrl);
    return { events: r.data };
  }
  catch (err)
  {
    console.log(err);
    return [];
  }
};

const fetchLanguageResources = async () => {
  const messages = {
    title: 'Scheduler Demo',
    userSelectLabel: 'Team Members\' Calendars to View',
    userSelectPlaceholder: 'Add Team Members...',
    workingHoursLabel: 'Working Hours Only'
  };

  // Return promise to simulate async
  return new Promise(resolve => resolve(messages));
};

export {
  fetchLanguageResources,
  fetchSchedule,
  fetchUsers,
  fetchUserEvents
};
