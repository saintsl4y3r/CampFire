import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert 
} from '@mui/material';
import { LOGIN } from '../graphql/authentication';
import jwtDecode from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loginMutation, { loading }] = useMutation(LOGIN);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginMutation({
        variables: {
          input: {
            username: formData.username,
            password: formData.password
          }
        }
      });
      const { data, errors } = response;

      console.log('Full response from server:', JSON.stringify(response, null, 2));

      if (errors) {
        console.error('GraphQL Errors:', errors);
        setError(errors[0]?.message || 'Lỗi không xác định từ server');
        return;
      }

      if (data && data.login) {
        if (data.login.success) {
          const { jwt } = data.login.data || {};
          console.log('Extracted JWT:', jwt);

          if (jwt) {
            localStorage.setItem('jwt', jwt);
            // Giải mã JWT để lấy role
            try {
              const decodedToken = jwtDecode(jwt);
              const role = decodedToken.role;
              console.log('Decoded role from JWT:', role);

              if (role) {
                localStorage.setItem('userRole', role);
                switch (role) {
                  case 'admin':
                    navigate('/admin/dashboard');
                    break;
                  case 'manager':
                    navigate('/admin/dashboard');
                    break;
                  case 'customer':
                    navigate('/home');
                    break;
                  default:
                    setError('Vai trò không hợp lệ');
                }
              } else {
                console.error('Role not found in JWT payload');
                setError('Vai trò không được tìm thấy trong token');
              }
            } catch (decodeError) {
              console.error('Error decoding JWT:', decodeError);
              setError('Không thể giải mã token xác thực');
            }
          } else {
            console.error('JWT not found in response');
            setError('Không nhận được token xác thực');
          }
        } else {
          setError(data.login.message || 'Tên người dùng hoặc mật khẩu không đúng');
        }
      } else {
        console.error('Invalid response structure:', data);
        setError('Phản hồi từ server không hợp lệ');
      }
    } catch (err) {
      console.error('Apollo Error:', err);
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center">
            Đăng nhập
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Tên người dùng"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            <Box textAlign="center">
              <Link to="/reset-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" gutterBottom>
                  Quên mật khẩu?
                </Typography>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Chưa có tài khoản? Đăng ký ngay
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;