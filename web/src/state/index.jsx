import React from 'react';;

// Calendar settings, filters, etc.
const CalendarContext = React.createContext();
const calendarContextInitialState = {
  selectedUsers: [],
  workSchedule: true,
  currentView: 'dayGridMonth',
  lastView: 'dayGridMonth',
  calendarComponentRef: React.createRef(),
  currenttime_zone: 'America/Los_Angeles',
  timeZoneNames: [
    'Pacific/Honolulu',
    'America/Los_Angeles',
    'America/Chicago',
    'America/New_York',
    'Etc/GMT',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Seoul',
    'Asia/Tokyo'
  ]
}

// User data, event data, etc.
const DataContext = React.createContext();
const dataContextInitialState = {
  events: [],
  users: [],
  loading: false,
  initialized: false
};

// Language data
const LanguageContext = React.createContext();
const languageContextInitialState = {
  title: 'Scheduler Demo',
  userSelectLabel: 'Team Members\' Calendars to View',
  userSelectPlaceholder: 'Add Team Members...',
  workingHoursLabel: 'Working Hours Only',
  monthLabel: 'Month',
  weekLabel: 'Week',
  selectTimeZoneLabel: 'Select IANA Time Zone'
}

// Dumb reducer for everything just merges updated and new values into existing state
//const genericReducer = (a, b) => ({ ...a, ...b })

const genericReducer = (a, b) => {
  return { ...a, ...b };
}

export {
  CalendarContext,
  DataContext,
  LanguageContext,
  calendarContextInitialState,
  dataContextInitialState,
  languageContextInitialState,
  genericReducer
}