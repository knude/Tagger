import { useAuth0 } from "@auth0/auth0-react";

const User = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <h1>Loading...</h1>

  if (!user || !isAuthenticated) {
    return <h1>Not logged in</h1>
  }

  return (
    <article>
      <img className="round" src={user.picture} alt={user.name} />
      <h1>{user.nickname}</h1>
      <p>Email: {user.email}</p>
    </article>
  );
}

export default User;