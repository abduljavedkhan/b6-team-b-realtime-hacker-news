import { useEffect, useContext } from 'react';
import Router, { useRouter } from 'next/router';
import { magic } from '../lib/magic';
import { UserContext } from '../lib/UserContext';
import Loading from '../components/loading';

const Callback = () => {
  const router = useRouter();
  const [user, setUser] = useContext(UserContext);
try{
 // The redirect contains a `provider` query param if the user is logging in with a social provider
 useEffect(() => {
  router.query.provider ? finishSocialLogin() : finishEmailRedirectLogin();
}, [router.query]);

// `getRedirectResult()` returns an object with user data from Magic and the social provider
const finishSocialLogin = async () => {
  let result = await magic.oauth.getRedirectResult();
  authenticateWithServer(result.magic.idToken);
};

// `loginWithCredential()` returns a didToken for the user logging in
const finishEmailRedirectLogin = () => {
  if (router.query.magic_credential)
    magic.auth.loginWithCredential().then((didToken) => authenticateWithServer(didToken));
};

// Send token to server to validate
const authenticateWithServer = async (didToken) => {
  let res = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + didToken,
    },
  });

  if (res.status === 200) {
    // Set the UserContext to the now logged in user
    let userMetadata = await magic.user.getMetadata();
    await setUser(userMetadata);
    Router.push('/');
  }
    }
  }catch(error){
  console.log("Error: Callback request " + error);
            if (err instanceof RPCError) {
                switch(err.code) {
                  case RPCErrorCode.MagicLinkFailedVerification:
                    console.log("Authentication Failed ");
                    break;
                  case RPCErrorCode.MagicLinkExpired:
                    console.log("Session Expired, Please login to continue");
                    break;
                  case RPCErrorCode.MagicLinkRateLimited:
                    console.log("Request Limit Exceeded ");
                    break;
                  case RPCErrorCode.UserAlreadyLoggedIn:
                    console.log("User already logged-In ");
                    // Handle errors accordingly :)
                    break;
                }
            }
   };

  return <Loading />;
};

export default Callback;
