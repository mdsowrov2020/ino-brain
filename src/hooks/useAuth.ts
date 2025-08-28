import { useUser } from "@clerk/nextjs";

export const useAuth = () => {
  const { user, isSignedIn, isLoaded } = useUser();

  return {
    isLoaded,
    isSignedIn,
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
          imageUrl: user.imageUrl,
        }
      : null,
  };
};
