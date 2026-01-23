import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { usePersonalGoalsStore } from '../../zustand/PersonalGoalsStore';
import { Grid4x4 } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';

export const PersonalGoalSettings: React.FC = () => {
  const { personalGoalsList } = usePersonalGoalsStore();

  return (
    <Grid container spacing={2}>
      {personalGoalsList.map((goal) => (
        <>
          <Grid size={3}>
            <Typography variant='h6'>{goal.amount}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant='h6'>{goal.sport}</Typography>
          </Grid>
        </>
      ))}
      <Grid size={12}>
        <Button variant='contained' startIcon={<AddIcon />}>
          {' '}
          Add Personal Goal
        </Button>
      </Grid>
    </Grid>
  );
};
