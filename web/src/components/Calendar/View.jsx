import React, { useContext } from 'react';
import {
  Link,
  useHistory,
  useParams,
  withRouter
} from 'react-router-dom';
import queryString from 'query-string';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import MenuIcon from '@material-ui/icons/Menu';
import {
  Breadcrumbs,
  CircularProgress,
  TextareaAutosize,
  Toolbar,
  Typography,
  withStyles
} from '@material-ui/core';

import {
  CalendarContext,
  DataContext,
  LanguageContext
} from 'state';

const styles = theme => ({
  calendar: {
    '& .fc-today-button, & .fc-button': {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.light
      }
    },
    width: '95%',
    margin: '0 auto',
    flexGrow: 1,
  },
  link: {
    display: 'flex',
  },
  icon: {
    marginRight: theme.spacing(0.5),
    width: 20,
    height: 20,
  },
  calendarDisplay: {
    flexGrow: 1
  },
});

const CalendarView = ({ classes, theme }) => {
  const { calendarOptions, updateOptions } = useContext(CalendarContext);
  const appData = useContext(DataContext);
  const messages = useContext(LanguageContext);

  let { day } = useParams();
  let history = useHistory();
  
  let { view, time_zone } = queryString.parse(history.location.search);

  const handleEventClick = data => {
    const newView = calendarOptions.currentView === 'timeGridWeek' ? 'dayGridMonth' : 'timeGridWeek';
    let loc = `/week/${data.event.extendedProps.startDate}`;
    if (view || newView || time_zone)
    {
      loc += `?`
    }
    if (view || newView)
    {
      loc += `view=${newView || view}`;
    }
    if (time_zone)
    {
      loc += `&time_zone=${time_zone}`;
    }
    history.push(loc);
  };

  const getSimpleDate = dateObj => dateObj.toISOString().split('T')[0];

  const calendarViewContextConsumer = (events, currentView) => {
    let fullCalendarProps = {
      timeZone: time_zone ? time_zone : 'local',
      handleWindowResize: TextareaAutosize,
      events: events,
      eventClick: handleEventClick,
      initialView: view ? view : currentView,
      initialDate: day ? day : new Date(),
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
        momentTimezonePlugin
      ],
      eventDidMount: ({ event }) => {
        if (event.extendedProps.freeTime)
        {
          event.setProp('backgroundColor', theme.palette.success.main);
          event.setProp('borderColor', '#000')
        }
        else
        {
          event.setProp('backgroundColor', theme.palette.error.main);
          event.setProp('borderColor', '#000')
        }
      },
      datesSet: ({ start, end }) => {
        updateOptions({
          range: {
            start: getSimpleDate(start),
            end: getSimpleDate(end)
          }
        });
      },
      eventsSet: e => {
        e = e.map(e => ({ ...e, start: e.allDay ? new Date(e.extendedProps.startDate).toISOString() : e.start }))
        return e;
      }
    };
    return (
      <div className={classes.calendar}>
        <Toolbar>
          <Breadcrumbs aria-label="breadcrumb">
            {history.location.pathname !== '/'
            ? (
              
              <Link color="inherit" to="/" onClick={()=>history.push(`/`)} className={classes.link}>
                <MenuIcon className={classes.icon} />
                {messages.monthLabel}
              </Link>
            )
            : (
              <Typography className={classes.link} color="textPrimary"><MenuIcon className={classes.icon} />
                {messages.monthLabel}
              </Typography>
            )}
            {history.location.pathname !== '/' ? (
              <Typography className={classes.link} color="textPrimary">
                <MenuIcon className={classes.icon} />{messages.weekLabel}
              </Typography>
            ): null}
          </Breadcrumbs>
          {appData.loading && <CircularProgress style={{ margin: '0 auto' }} color="secondary" />}
        </Toolbar>
        <Toolbar>
          <div className={classes.calendarDisplay}>
            <FullCalendar ref={calendarOptions.calendarComponentRef} {...fullCalendarProps} />
          </div>
        </Toolbar>
      </div>
    );
  };

  return (
    <CalendarContext.Consumer>
      {calendarViewContextConsumer}
    </CalendarContext.Consumer>
  );
}

export default withStyles(styles, { withTheme: true })(withRouter(CalendarView));