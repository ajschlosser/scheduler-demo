import React, { useContext } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { withStyles } from '@material-ui/core/styles';

import {
  CalendarContext,
  DataContext
} from 'state';

const styles = theme => ({
  userList: {
    width: '100%',
    margin: '1em 0',
    '& > * + *': {
      marginTop: theme.spacing(3),
    },
  },
});

const UserSelect = ({ classes, userSelectLabel, userSelectPlaceholder }) => {
  const { calendarOptions, updateOptions } = useContext(CalendarContext);
  const { appData } = useContext(DataContext);
  return (
    <div className={classes.userList}>
      <FormGroup>
        <Autocomplete
          multiple
          id='tags-outlined'
          options={appData.users || []}
          getOptionLabel={o => `${o.name} (${o.user_id}) (${o.time_zone.split('/')[1].replace('_', ' ')})`}
          value={calendarOptions.selectedUsers || []}
          filterSelectedOptions
          fullWidth={true}
          ChipProps={{
            color: 'primary'
          }}
          renderInput={params => (
            <TextField
              {...params}
              variant='outlined'
              label={userSelectLabel}
              placeholder={userSelectPlaceholder}
            />
          )}
          onChange={(e, u) => updateOptions({ selectedUsers: u })}
        />
      </FormGroup>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(UserSelect);
