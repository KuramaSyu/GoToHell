import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
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
    <Modal open={open}>
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography variant='body1'>{message}</Typography>
        </CardContent>
        <CardActions>
          <Button variant='contained' color='warning' onClick={onConfirm}>
            Yes
          </Button>
          <Button variant='outlined' color='secondary' onClick={onCancel}>
            No
          </Button>
        </CardActions>
      </Card>
    </Modal>
  );
};
