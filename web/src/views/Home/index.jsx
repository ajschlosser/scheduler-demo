import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import { withTheme } from '@material-ui/core/styles';

// Components
import { AppControls } from 'components/AppControls';
import { CalendarView } from 'components/Calendar';

function Home() {

  return (
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
  );
}

export default withTheme(Home);
