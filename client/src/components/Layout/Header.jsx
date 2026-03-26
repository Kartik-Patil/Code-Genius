import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <Link to="/dashboard" className="header-logo">
        <span className="header-logo-icon">⚡</span>
        <span className="header-logo-text">Code Genius</span>
      </Link>

      <nav className="header-nav">
        <Link to="/dashboard">Editor</Link>
        <Link to="/history">History</Link>
      </nav>

      <div className="header-user">
        {user && <span className="header-username">{user.username || 'Account'}</span>}
        <button onClick={handleLogout} className="btn-logout">
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
