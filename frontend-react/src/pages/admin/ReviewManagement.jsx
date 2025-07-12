import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Stack,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_REVIEWS, DELETE_REVIEW, UPDATE_REVIEW } from "../../graphql/review";

export default function ReviewManagement() {
  const { data, loading, error, refetch } = useQuery(GET_ALL_REVIEWS, {
    variables: { first: 100, offset: 0 }
  });
  const [deleteReview] = useMutation(DELETE_REVIEW, { onCompleted: refetch });
  const [updateReview] = useMutation(UPDATE_REVIEW, { onCompleted: refetch });

  const [selected, setSelected] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [updated, setUpdated] = useState({ rating: 0, comment: '' });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  const reviews = data.reviews.nodes;

  const handleDelete = (_id) => {
    deleteReview({ variables: { input: { _id } } });
  };

  const handleOpenEdit = (r) => {
    setSelected(r);
    setUpdated({ rating: r.rating, comment: r.comment });
    setOpenEdit(true);
  };

  const handleSaveEdit = () => {
    updateReview({
      variables: {
        input: {
          _id: selected._id,
          productId: selected.productId,
          customerId: selected.customerId,
          rating: updated.rating,
          comment: updated.comment,
          imageFile: selected.imageFile
        }
      }
    });
    setOpenEdit(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Quản lý Review</Typography>
      {reviews.length === 0 && <Alert>Chưa có review nào.</Alert>}
      <Stack spacing={2} sx={{ mt: 2 }}>
        {reviews.map(r => (
          <Box key={r._id} sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle1">{r.customerId}</Typography>
              <Stack direction="row" spacing={1}>
                <IconButton onClick={() => handleOpenEdit(r)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDelete(r._id)}><DeleteIcon /></IconButton>
              </Stack>
            </Stack>
            <Rating value={r.rating} readOnly size="small" />
            <Typography sx={{ mt:1 }}>{r.comment}</Typography>
          </Box>
        ))}
      </Stack>

      {/* Dialog Edit */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
        <DialogTitle>Chỉnh sửa Review</DialogTitle>
        <DialogContent>
          <Rating
            value={updated.rating}
            onChange={(_, v) => setUpdated(u => ({ ...u, rating: v }))}
          />
          <TextField
            label="Nhận xét"
            multiline
            rows={4}
            fullWidth
            sx={{ mt:2 }}
            value={updated.comment}
            onChange={e => setUpdated(u => ({ ...u, comment: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
