const crypto = require('crypto');

const {
  dayjs,
  uuid4
} = require('../../util.js');

class GenericTimeRange {
  constructor(start = dayjs.utc(dayjs()), end = dayjs.utc(start).add(1, 'day'), title, expandedProps = {}) {
    this.uuid4 = uuid4();
    this.start = dayjs.utc(start);
    this.end = dayjs.utc(end);
    this.startDate = this.start.format('YYYY-MM-DD');
    this.md5 = crypto.createHash('md5').update(this.start.format() + this.end.format()).digest('hex');
    this.description = `${this.start.utc().format()} (${this.start.utc().format('dd MMM DD')}) to ${this.end.utc().format()} (${this.end.utc().format('dd MMM DD')})`;
    if (title) this.title = title;
    Object.keys(expandedProps).forEach(k => this[k] = expandedProps[k]);
  }
  valueOf() {
    return this.md5;
  }
}

class BusyTimeRange extends GenericTimeRange {
  constructor(start, end, title, expandedProps = {}) {
    super(start, end, title);
    this.busyTime = true;
    Object.keys(expandedProps).forEach(k => this[k] = expandedProps[k]);
  }
}

class FreeTimeRange extends GenericTimeRange {
  constructor(start, end, title) {
    super(start, end, title);
    this.freeTime = true;
  }
}

class AllDayTimeRange extends GenericTimeRange {
  constructor(day, title, expandedProps = {}) {
    day = dayjs(day);
    super(day.startOf('day'), day.endOf('day'), title);
    this.allDay = true;
    Object.keys(expandedProps).forEach(k => this[k] = expandedProps[k]);
  }
}

class Event extends GenericTimeRange {
  constructor(start = dayjs.utc(dayjs()), end = dayjs.utc(start).add(1, 'day'), title, expandedProps = {}) {
    super(start, end, title);
    this.event_id = uuid4();
    this.active = 1;
    Object.keys(expandedProps).forEach(k => this[k] = expandedProps[k]);
  }
}

const generateFakeEvents = options => {
  let { count = 0, overrides = [], dates, time_zone = 'UTC' } = options;
  if (Number.isInteger(options)) count = options;
  if (overrides.length > count) count = overrides.length;
  if (!dates) dates = [new Date().toISOString()];
  let titles = [
    'fly-fishing competition',
    'yak brushing',
    'yogurt tasting',
    'getting jacket zipper unstuck',
    'taking car to get new novelty horn',
    'requirements meeting',
    'at the dentist'
  ];
  let fakeEvents = [];
  dates.forEach(d => {
    let dailyEvents = [];
    while (dailyEvents.length < count)
    {
      // Simulate user entering date in own time_zone
      let s = dayjs.tz(d, time_zone).startOf('day').add(10 + Math.floor(Math.random() * 3), 'hours'); // 10-12
      let e = s.add(1 + Math.floor(Math.random() * 3), 'hours'); // 10-12 + 1-2

      // New event will convert times to UTC
      let event = new Event(s, e, titles[Math.floor(Math.random() * titles.length)]);
      dailyEvents.push(event);
    }
    fakeEvents = fakeEvents.concat(dailyEvents);
  });
  return fakeEvents;
};

module.exports = {
  GenericTimeRange,
  BusyTimeRange,
  FreeTimeRange,
  AllDayTimeRange,
  Event,
  generateFakeEvents
};
