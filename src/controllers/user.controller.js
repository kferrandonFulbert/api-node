export const profile = (req, res) => {
  res.json({
    id: req.user.id,
    role: req.user.role
  });
};

export const info = (req, res) => {
  res.json({
    msg: "ok"
  });
};