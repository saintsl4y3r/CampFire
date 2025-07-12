import React from 'react';
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Stack,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_ALL_REVIEWS } from '../graphql/review';

export default function ReviewList({ productId }) {
  const { data, loading, error } = useQuery(GET_ALL_REVIEWS, {
    variables: { first: 100, offset: 0 }
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  const all = data.reviews.nodes;
  const reviews = all.filter(r => r.productId === productId);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Đánh giá sản phẩm</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Rating value={avgRating} precision={0.1} readOnly />
        <Typography sx={{ ml: 1 }}>({avgRating.toFixed(1)})</Typography>
      </Box>
      {reviews.length === 0 ? (
        <Typography>Chưa có đánh giá nào.</Typography>
      ) : (
        <Stack spacing={2}>
          {reviews.map(r => (
            <Box key={r._id} sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar>{r.customerId[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle2">{r.customerId}</Typography>
                  <Rating value={r.rating} readOnly size="small" />
                </Box>
              </Stack>
              <Typography sx={{ mt: 1 }}>{r.comment}</Typography>
              {r.imageFile?.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {r.imageFile.map((url, i) => (
                    <Grid item key={i} xs={4}>
                      <Box
                        component="img"
                        src={url}
                        alt=""
                        sx={{ width: '100%', borderRadius: 1 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
