import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_REVIEW_BY_PRODUCT_ID_CUSTOMER_ID,
  CREATE_REVIEW,
  UPDATE_REVIEW
} from '../graphql/review';

export default function ReviewForm({ productId, customerId }) {
  const { data, loading: qLoading, error: qError } = useQuery(
    GET_REVIEW_BY_PRODUCT_ID_CUSTOMER_ID,
    { variables: { productId, customerId } }
  );

  const [createReview] = useMutation(CREATE_REVIEW, {
    refetchQueries: [{ query: GET_REVIEW_BY_PRODUCT_ID_CUSTOMER_ID, variables: { productId, customerId } }]
  });
  const [updateReview] = useMutation(UPDATE_REVIEW, {
    refetchQueries: [{ query: GET_REVIEW_BY_PRODUCT_ID_CUSTOMER_ID, variables: { productId, customerId } }]
  });

  const existing = data?.reviewByProductIdCustomerId;
  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || '');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (existing) {
      setRating(existing.rating);
      setComment(existing.comment);
    }
  }, [existing]);

  const handleFileChange = e => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const input = {
      productId,
      customerId,
      rating,
      comment,
      imageFile: files 
    };
    try {
      if (existing) {
        await updateReview({ variables: { input: { _id: existing._id, ...input } } });
      } else {
        await createReview({ variables: { input } });
      }
      alert('Đánh giá đã lưu');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu đánh giá');
    }
  };

  if (qLoading) return <CircularProgress />;
  if (qError) return <Alert severity="error">{qError.message}</Alert>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {existing ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
      </Typography>
      <Rating
        name="rating"
        value={rating}
        onChange={(_, v) => setRating(v)}
      />
      <TextField
        label="Nhận xét"
        multiline
        rows={4}
        required
        fullWidth
        margin="normal"
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <Button variant="contained" component="label">
        Tải lên hình ảnh
        <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
      </Button>
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
        {files.map((f, i) => (
          <Typography key={i} variant="body2">{f.name}</Typography>
        ))}
      </Stack>
      <Button
        type="submit"
        variant="contained"
        sx={{ mt: 2 }}
        disabled={rating === 0 || !comment}
      >
        {existing ? 'Cập nhật' : 'Gửi đánh giá'}
      </Button>
    </Box>
  );
}
