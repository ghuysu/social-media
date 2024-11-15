import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SignInGoogle = () => {
  const query = useQuery();
  const result = query.get('result');
  const email = query.get('email');
  const sign_in_token = query.get('sign_in_token');

  useEffect(() => {
    console.log({ query, result, email, sign_in_token });
    if (result == 'true') {
      window.location.href = `app://google.login.skyline/true/${email}/${encodeURIComponent(sign_in_token)}`;
    } else {
      window.location.href = `app://google.login.skyline/false`;
    }

    const timeout = setTimeout(() => {
      window.location.href = 'https://selection-page.onrender.com/abc';
    }, 3000);

    return () => clearTimeout(timeout);
  }, [result, email, sign_in_token]);

  return <h3>processing...</h3>;
};

export default SignInGoogle;
