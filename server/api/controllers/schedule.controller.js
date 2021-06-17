const {
  dayjs,
  sortRangesBy
} = require('../../util');

const {
  BusyTimeRange,
  FreeTimeRange,
  Event
} = require('../models/event.model');
const { getUserEvents } = require('./event.controller');

const getSchedule = (userId, start, end) => {
  start = dayjs.utc(start);
  end = dayjs.utc(end);

  return getUserEvents({
    id: userId,
    range: {
      start,
      end
    }
  });
};

const compareSchedules = async (users, start, end, pov_time_zone, workingHours=true) => {

  const debugLog = process.env.PRODUCTION !== 'true' ? console.log : () => {};

  const blocks = [];

  const rangeStart = dayjs.utc(start).subtract(2, 'days').startOf('day');
  const rangeEnd = dayjs.utc(end).add(2, 'days').startOf('day');

  // Get user events
  let userEvents = await getUserEvents({  // ORDER BY 'start', so events are ASC in that order
    id: users.map(u => u.user_id),
    range: { start: rangeStart, end: rangeEnd }
  });

  // Create events for non-work hours if filtering by working hours
  if (workingHours)
  {
    let workEvents = [];
    for (var d = rangeStart; d.isBefore(rangeEnd); d = d.add(1, 'days'))
    {
      for (let user of users)
      {

        if (user.workWeekStart < user.workWeekEnd)
        {
          if (d.day() < user.workWeekStart || d.day() > user.workWeekEnd)
          {
            let notWorking = new Event(d, d.add(1, 'day'), 'Not Working');
            workEvents.push(notWorking);            
          }
          else
          {
            if (user.workDayStart < user.workDayEnd)
            {
              let notWorkingEarly = new Event(d, d.add(user.workDayStart, 'hours'), 'Not Working');
              workEvents.push(notWorkingEarly);
              let notWorkingLate = new Event(d.add(user.workDayEnd, 'hours'), d.add(1, 'days'), 'Not Working');
              workEvents.push(notWorkingLate);
            }

            else
            {
              let notWorkingEarly = new Event(d.add(user.workDayEnd - 1, 'hours'), d.add(user.workDayStart, 'hours'), 'Not Working'); // - 1
              //let notWorkingEarly = new Event(d, d.add(user.workDayStart, 'hours'), 'Not Working');
              workEvents.push(notWorkingEarly);
              let notWorkingLate = new Event(d.add(23 + user.workDayEnd, 'hours'), d.add(1, 'day'), 'Not Working');
              workEvents.push(notWorkingLate);              
            }

          }


        }
      }
    }
    if (workEvents.length)
    {
      userEvents = sortRangesBy(userEvents.concat(workEvents), 'start');
    }
  }

  // Dedupe events
  const dedupeMap = {};
  let dedupedUserEvents = userEvents.filter(event => {
    if (!dedupeMap[event.md5])
    {
      dedupeMap[event.md5] = true;
      return true;
    }
    return false;    
  });

  let busyBlock = {};
  let freeBlock = {};

  if (!dedupedUserEvents.length)
  {
    debugLog(`No events for this range`);
    let allFree = new FreeTimeRange(rangeStart, rangeEnd, 'Free Block');
    blocks.push(allFree);
    return blocks;
  }

  debugLog(`\n==========\nEvents in range (count: ${dedupedUserEvents.length}):\n==========`);
  dedupedUserEvents.forEach((e, i) => debugLog(`* ${i}: ${e.description}`));

  let stackedEvents = dedupedUserEvents.filter(e => {
    for (let e1 of dedupedUserEvents)
    {
      if (e.uuid4 !== e1.uuid4 && e.start.isSameOrAfter(e1.start) && e.end.isSameOrBefore(e1.end))
      {
        return false;
      }
      if (e.start.isSame(e.end))
      {
        return false;
      }
    }
    return true;
  });

  debugLog('reduced', dedupedUserEvents.length, 'to', stackedEvents.length);
  dedupedUserEvents = stackedEvents;

  for (let i = 0; i < dedupedUserEvents.length; i++)
  {

    const previousEvent = dedupedUserEvents[i-1]
    const currentEvent = dedupedUserEvents[i];
    const nextEvent = dedupedUserEvents[i+1];
    debugLog(`\n\n------------\nEvent ${i}/${dedupedUserEvents.length-1}: ${currentEvent.description}\n------------`);

    if (i === 0 || !previousEvent)
    {
      debugLog(`* Setting first block start to ${currentEvent.start}`);
      busyBlock.start = currentEvent.start;
    }
    if (nextEvent && nextEvent.start.isSameOrBefore(currentEvent.end))
    {
      debugLog(`- Next event ${i+1} starts at same time as or before this one ends, looking ahead`);
      let next = i + 1;
      // like a cursor?
      while (dedupedUserEvents[next])
      {
        let nextEventInLoop = dedupedUserEvents[next];
        let currentEventInLoop = dedupedUserEvents[next-1];
        let eventAfterNextInLoop = dedupedUserEvents[next+1];
        debugLog(`- Cursor is at event ${next-1} ${currentEventInLoop.description}`)
        debugLog(`- Looking ahead to event ${next}: ${nextEventInLoop.description}`);
        
        if (nextEventInLoop.start.isSameOrBefore(currentEventInLoop.end))
        {
          debugLog(`- Next event starts before or at the same time as this one ends`);
          if (nextEventInLoop.end.isAfter(currentEventInLoop.end))
          {
            debugLog(`- Next event ends after current event`);
            debugLog(`- Next event is NOT subsumed by the the current event`);
          }
          else
          {
            debugLog(`- Next event ends before or at the same time as current event`);
            debugLog(`- Next event is subsumed by the the current event`);
          }
          debugLog(`- Incrementing event cursor`);
          next++;
          debugLog(`- Will look further ahead to event ${next}`);
          continue;
        }

        if (nextEventInLoop.start.isAfter(currentEventInLoop.end))
        {
          busyBlock.end = currentEventInLoop.end;
          debugLog(`- Next event starts after the current event`);
          debugLog(`* Setting busy block end to current event end ${busyBlock.end.format()}`);
          if (eventAfterNextInLoop)
          {
            freeBlock.start = busyBlock.end;
            freeBlock.end = nextEventInLoop.start;
            debugLog(`* Setting free block start to busy block end ${busyBlock.end.format()}`);
            debugLog(`* Setting free block end to next event start ${nextEventInLoop.start.format()}`);
          }
        }

        debugLog(`- Next event to process will be ${next-1}`);
        break;
      }
      i = next - 1;
  
    }
    else
    {
      debugLog(`Event ${i} ends before the next event starts`);
      busyBlock.end = currentEvent.end;

      // For later events that do not subsume other events
      if (!busyBlock.start)
      {
        busyBlock.start = currentEvent.start;
      }
    }

    if (dedupedUserEvents[i+1])
    {
      debugLog(`Next event to process will be event ${i+1}`);
    }
    else if (workingHours)
    {
      busyBlock.end = rangeEnd;
    }
    else if (!workingHours)
    {
      busyBlock.end = currentEvent.end;
    }


    if (busyBlock.start && busyBlock.end)
    {
      let bblock = new BusyTimeRange(busyBlock.start, busyBlock.end, 'Busy Block', { ...busyBlock.meta });
      blocks.push(bblock);
      debugLog(`* Setting free block start to newly minted busy block end ${busyBlock.end.format()}`);
      freeBlock.start = busyBlock.end;
      if (nextEvent && !freeBlock.end)
      {
        freeBlock.end = nextEvent.start;
        debugLog(`* Setting free block end to next event start ${nextEvent.start.format()}`);
      }
      busyBlock = {
        start: freeBlock.end ? freeBlock.end : null
      }
      //i = n - 1;
      debugLog(`*** Busy block ${bblock.uuid4} ****\n* Adding busy block "${bblock.description}" [${bblock.uuid4}]`);
    }
    if (freeBlock.start && freeBlock.end && freeBlock.start.isBefore(freeBlock.end))
    {
      let fblock = new FreeTimeRange(freeBlock.start, freeBlock.end, 'Free Block', { ...freeBlock.meta });
      blocks.push(fblock);
      freeBlock = {};
      debugLog(`*** Free block ${fblock.uuid4} ****\n* Adding free block "${fblock.description}" [${fblock.uuid4}]`);
    }


  }
  debugLog(`Consolidated ${dedupedUserEvents.length} deduped user events into ${blocks.length} busy and free blocks`);

  // if (!blocks.length)
  // {
  //   let allFree = new FreeTimeRange(rangeStart, rangeEnd, 'Free Block');
  //   blocks.push(allFree);
  //   return blocks;
  // }

  const sortedBlocks = sortRangesBy(blocks, 'start');

  if (!workingHours)
  {
    if (sortedBlocks[0].start.isAfter(start))
    {
      let fblock = new FreeTimeRange(rangeStart, sortedBlocks[0].start, 'Free Block', { initialFree: true });
      sortedBlocks.unshift(fblock);
      debugLog(`*** Initial free block ${fblock.uuid4} ****\n* Adding initial free block "${fblock.description}" [${fblock.uuid4}]`);    
    }
    if (sortedBlocks.slice(-1)[0].end.isBefore(end))
    { 
      let fblock;
      if (!sortedBlocks.slice(-1)[0].freeTime)
      {
        fblock = new FreeTimeRange(sortedBlocks.slice(-1)[0].end, rangeEnd, 'Free Block', { finalFree: true });
        sortedBlocks.push(fblock);
      }
      else
      {
        fblock = sortedBlocks.pop();
        fblock.end = rangeEnd;
        sortedBlocks.push(fblock);
      }
      debugLog(`*** Adjusting free block ${fblock.uuid4} ****\n* Adjusting final free block "${fblock.description}" [${fblock.uuid4}]`);
    }
  }

  

  return sortedBlocks;
}

module.exports = {
  getSchedule,
  compareSchedules
};