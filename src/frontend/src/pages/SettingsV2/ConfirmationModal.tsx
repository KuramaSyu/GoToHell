import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  Modal,
  Typography,
} from '@mui/material';

export const ConfirmationModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  open,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  open: boolean;
}) => {
  return (
    <Dialog open={open}>
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography variant='body1'>{message}</Typography>
        </CardContent>
        <CardActions>
          <Button variant='contained' color='error' onClick={onConfirm}>
            Yes
          </Button>
          <Button variant='contained' color='primary' onClick={onCancel}>
            No
          </Button>
        </CardActions>
      </Card>
    </Dialog>
  );
};
