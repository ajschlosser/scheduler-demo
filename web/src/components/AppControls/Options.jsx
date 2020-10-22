import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import queryString from 'query-string';
import Switch from '@material-ui/core/Switch';
import Toolbar from '@material-ui/core/Toolbar';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import { CalendarContext } from 'state';

const styles = () => ({
  optionsToolbar: {
    padding: '0.25em 0 2em',
  },
  divider: {
    margin: '0 1em'
  },
});

const ScheduleOptions = ({ workingHoursLabel, selectTimeZoneLabel, classes }) => {
  const { calendarOptions, updateOptions } = useContext(CalendarContext);
  const history = useHistory();
  const { view } = queryString.parse(history.location.search);
  const onChangeHandler = () => {
    updateOptions({
      workSchedule: !calendarOptions.workSchedule
    });
  };
  const ontime_zoneChangeHandler = e => {
    updateOptions({ currenttime_zone: e.target.value });
    let loc = `${history.location.pathname}`;
    if (view || e.target.value)
    {
      loc += `?`
    }
    if (view)
    {
      loc += `view=${view}`;
    }
    if (e.target.value)
    {
      loc += `&time_zone=${e.target.value}`;
    }
    history.push(loc);
  };
  return (
    <Toolbar className={classes.optionsToolbar}>
      <FormGroup style={{ display: 'flex' }}>
        <FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={calendarOptions && calendarOptions.workSchedule}
                onChange={onChangeHandler}
              />
            }
            label={workingHoursLabel}
          />
        </FormControl>
      </FormGroup>
      <Divider orientation="vertical" flexItem className={classes.divider} />
      <FormGroup>
        <FormControl>
          <InputLabel id="select-timezone-label">Your Timezone:</InputLabel>
          <Select
            id="select-timezone"
            labelId="select-timezone-label"
            value={queryString.parse(history && history.location.search).time_zone || calendarOptions.currenttime_zone || `America/Los_Angeles`}
            onChange={ontime_zoneChangeHandler}
            label={selectTimeZoneLabel}
          >
            {
              calendarOptions.timeZoneNames
                .map(time_zone => <MenuItem key={time_zone} value={time_zone}>{time_zone.replace('_', ' ')}</MenuItem>)
            }
          </Select>
          <FormHelperText>Schedules are viewed from this timezone's point of view</FormHelperText>
        </FormControl>
      </FormGroup>
    </Toolbar>
  );
}

export default withStyles(styles, { withThem: true })(ScheduleOptions);