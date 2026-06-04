const signup = (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email)
      throw new Error("Username, password and email are required");
  } catch (error) {
    next(error);
  }
};
