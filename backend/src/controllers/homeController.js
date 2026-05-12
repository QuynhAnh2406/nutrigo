const getHome = (req, res) => {
  res.json({ message: 'Welcome to the MVC Backend!' });
};

module.exports = {
  getHome
};
