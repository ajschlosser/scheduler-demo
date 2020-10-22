import React, { useContext } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CalendarTodayRoundedIcon from '@material-ui/icons/CalendarTodayRounded';
import { withStyles } from '@material-ui/core/styles';

import { LanguageContext } from 'state';
import ScheduleOptions from './Options';
import UserSelect from './UserSelect';

const styles = theme => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  icon: {
    marginRight: '1em',
  },
  modal: {
    backgroundColor: '#fff',
    height: '10em'
  },
});

const AppControls = ({ classes }) => {

  const messages = useContext(LanguageContext);

  return (
    <AppBar position="sticky" >
      <Toolbar>
        <CalendarTodayRoundedIcon className={classes.icon} />
        <Typography variant="h6" className={classes.title}>
          {messages.title}
        </Typography>
      </Toolbar>
      <Toolbar>
        <UserSelect
          userSelectLabel={messages.userSelectLabel}
          userSelectPlaceholder={messages.userSelectPlaceholder}
        />
      </Toolbar>
      <Toolbar>
        <ScheduleOptions
          workingHoursLabel={messages.workingHoursLabel}
          selectTimeZoneLabel={messages.selectTimeZoneLabel}
        />
      </Toolbar>
    </AppBar>
  );
};

export default withStyles(styles, { withTheme: true })(AppControls);