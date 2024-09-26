import './App.css'
import HomePage from './components/HomePage';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import ChangePasswordForm from './components/ChangePasswordForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import PrivateRoutes from './components/PrivateRoutes';
import KeepSignedIn from './components/KeepSignedIn';
import ProfilePage from './components/ProfilePage';

function App() {
  useEffect(() => {
    /*const handleTabClose = () => {
        localStorage.removeItem('authToken'); // Eliminar el token
    };

    window.addEventListener('beforeunload', handleTabClose);

    return () => {
        window.removeEventListener('beforeunload', handleTabClose);
    };
}, []);*/
  return (
    <Router>
      <Routes>
        <Route element={<PrivateRoutes/>}>
          <Route exact path='/index' element={<HomePage/>} />
          <Route exact path='/change-password' element={<ChangePasswordForm/>} />
          <Route exact path='/profile' element={<ProfilePage/>} />
        </Route>
        {/* <Route element={<KeepSignedIn/>}>*/}
          <Route exact path='/' element={<LoginForm/>} />
        {/*</Route>*/}
        <Route exact path='/reset-password' element={<ResetPasswordForm />} />
        <Route exact path="/register" element={<RegisterForm />} />
        <Route exact path='/forgot-password' element={<ForgotPasswordForm />} />
      </Routes>
    </Router>
  )
}

export default App;
