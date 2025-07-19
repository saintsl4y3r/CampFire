import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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

import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname === '/admin/login';
  
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
            {isAdminLogin ? 'Admin Login' : 'Đăng nhập'}
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
            {!isAdminLogin && (
              <Box textAlign="center">
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Hoặc đăng nhập với
                  </Typography>
                      <GoogleLogin
                      onSuccess={credentialResponse => {
                        const token = credentialResponse.credential;
                        console.log('Google token received:', token);
                        
                        // Gửi token này về server
                        fetch('http://localhost:4000/api/auth/google', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ token })
                        })
                        .then(res => {
                          if (!res.ok) {
                            console.log(res);
                            throw new Error('Network response was not ok');
                          }
                          return res.json();
                        })
                        .then(data => {
                          console.log('Server response:', data);
                          
                          // xử lý kết quả từ server
                          if (data.status === 'new_user') {
                            // chuyển hướng đến trang đăng ký thêm thông tin
                            console.log('New user detected, redirecting to registration');
                            navigate('/register', { 
                              state: { 
                                googleUser: data.user,
                                isGoogleSignup: true 
                              } 
                            });
                          } else if (data.status === 'ok') {
                            // lưu JWT, redirect user vào hệ thống
                            console.log('Existing user, logging in');
                            localStorage.setItem('jwt', data.jwt);
                            localStorage.setItem('userRole', data.user.role || 'customer');
                            navigate('/home');
                          } else {
                            setError(data.message || 'Đăng nhập Google thất bại');
                          }
                        })
                        .catch(error => {
                          console.error('Google login error:', error);
                          setError('Không thể kết nối đến server');
                        });
                      }}
                      onError={() => {
                        console.log('Login Failed');
                        setError('Đăng nhập Google thất bại');
                      }}
                    />
                </Box>
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
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;