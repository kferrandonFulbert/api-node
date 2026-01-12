export const profile = (req, res) => {
  req.log?.info({ userId: req.user?.id }, 'profile requested');
  res.json({
    id: req.user.id,
    role: req.user.role
  });
};

export const info = (req, res) => {
  req.log?.info('info endpoint');
  res.status(200);
  res.json({
    msg: "ok"
  });
};