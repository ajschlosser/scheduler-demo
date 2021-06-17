import React, {
  useEffect,
  useReducer
} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory
} from 'react-router-dom';
import { withTheme } from '@material-ui/core/styles';

// State management
import {
  CalendarContext,
  DataContext,
  LanguageContext,
  calendarContextInitialState,
  dataContextInitialState,
  languageContextInitialState,
  genericReducer
} from 'state';

// API Service
import {
  fetchSchedule,
  fetchUsers,
  fetchUserEvents,
  fetchLanguageResources
} from 'services/api';

// Components
import { AppControls } from 'components/AppControls';
import { CalendarView } from 'components/Calendar';

import queryString from 'query-string';

function App() {

  const history = useHistory();

  // Containers and reducers for app data, calendar settings (filters, etc.)
  const [appData, dispatchAppData] = useReducer(genericReducer, dataContextInitialState);
  const [calendarOptions, dispatchCalendarOptions] = useReducer(genericReducer, calendarContextInitialState);
  const [languageData, dispatchLanguageData] = useReducer(genericReducer, languageContextInitialState);

  // Abstraction layer for reducer dispatch methods
  const updateData = obj => {
    dispatchAppData(obj);
  };
  const updateOptions = obj => {
    dispatchCalendarOptions(obj);
  };
  const updateLanguage = obj => {
    dispatchLanguageData(obj);
  };


  // Fetch users on load
  useEffect(() => {
    fetchUsers().then(({ users }) => {
      updateData({ users });
      updateOptions({ selectedUsers: users || []});
    });
  }, []);

  // Fetch new schedule data on load and when calendar options change
  useEffect(() => {
    if (calendarOptions.range)

      if (calendarOptions.selectedUsers.length > 1)

        fetchSchedule({
          users: calendarOptions.selectedUsers,
          start: calendarOptions.range.start,
          end: calendarOptions.range.end,
          options: {
            workSchedule: calendarOptions.workSchedule,
            time_zone: queryString.parse(history && history.location.search).time_zone
              || calendarOptions.currenttime_zone
          }
        }).then(updateData);

      else if (calendarOptions.selectedUsers.length === 1)

        fetchUserEvents({
          user_id: calendarOptions.selectedUsers[0].user_id,
          start: calendarOptions.range.start,
          end: calendarOptions.range.end
        }).then(updateData);


  }, [calendarOptions, history]);

  // Simulate fetching language data on load
  useEffect(() => {
    fetchLanguageResources().then(updateLanguage);
  }, []);

  return (
    <DataContext.Provider
      value={{
        appData,
        updateData
      }}
    >
      <CalendarContext.Provider
        value={{
          events: appData.events,
          calendarOptions,
          updateOptions,
          currentView: queryString.parse(history && history.location.search).view || calendarOptions.currentView
        }}
      >
        <LanguageContext.Provider
          value={{ ...languageData }}
        >
          <Router>
            <AppControls />
            <Switch>
              <Route exact path='/'>
                <div className='App'>
                  <CalendarView />
                </div>
              </Route>
              <Route path='/week/:day'>
                <CalendarView />
              </Route>
            </Switch>
          </Router>
        </LanguageContext.Provider>
      </CalendarContext.Provider>
    </DataContext.Provider>
  );
}

export default withTheme(App);
