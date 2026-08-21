import { User } from "../models/User";

const demoUser: User = {
  id: 1,
  name: "FinTrack User",
  email: "admin@fintrack.com",
};

const demoPassword = "admin123";

export const login = async (
  email: string,
  password: string
): Promise<User | null> => {
  // Temporary mock authentication
  // This will later call the .NET 8 API.

  await new Promise((resolve) =>
    setTimeout(resolve, 500)
  );

  if (
    email.toLowerCase() === demoUser.email &&
    password === demoPassword
  ) {
    return demoUser;
  }

  return null;
};

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  // Temporary mock registration.
  // Later this will call the .NET 8 API.

  await new Promise((resolve) =>
    setTimeout(resolve, 500)
  );

  return {
    id: Date.now(),
    name,
    email,
  };
};