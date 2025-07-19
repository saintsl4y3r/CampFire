import React from 'react';
import FacebookLogin from 'react-facebook-login';
import { useNavigate } from 'react-router-dom';

const FacebookLoginComponent = () => {
  const navigate = useNavigate();

  const responseFacebook = (response) => {
    console.log(response);
    
    if (response.accessToken) {
      // Lưu thông tin user vào localStorage
      const userData = {
        id: response.userID,
        name: response.name,
        email: response.email,
        picture: response.picture.data.url,
        accessToken: response.accessToken
      };
      
      localStorage.setItem('facebookUser', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      
      // Chuyển hướng đến trang admin
      navigate('/admin');
    } else {
      console.log('Login failed');
    }
  };

  const componentClicked = () => {
    console.log('Facebook login button clicked');
  };

  return (
    <div className="facebook-login-container">
      <FacebookLogin
        appId={import.meta.env.VITE_FACEBOOK_APP_ID || "4162030027352240"}
        autoLoad={false}
        fields="name,email,picture"
        onClick={componentClicked}
        callback={responseFacebook}
        cssClass="facebook-login-button"
        icon="fa-facebook"
        textButton=" Đăng nhập với Facebook"
      />
    </div>
  );
};

// Component để hiển thị thông tin user Facebook
export const FacebookUserInfo = () => {
  const user = JSON.parse(localStorage.getItem('facebookUser') || '{}');
  
  if (!user.id) return null;
  
  return (
    <div className="facebook-user-info">
      <img src={user.picture} alt={user.name} />
      <span>{user.name}</span>
    </div>
  );
};

// Hàm logout Facebook
export const logoutFacebook = () => {
  localStorage.removeItem('facebookUser');
  localStorage.removeItem('isLoggedIn');
  window.location.href = '/login';
};

export default FacebookLoginComponent;