const validateSingUpData = (req) => {
  const { firstName, email } = req.body;

  if (!firstName || !email) {
    throw new Error('First name and email are required');
  }
};

const validateProfileData = (req) => {
  const allowedEditFields = [
    'firstname',
    'lastname',
    'email',
    'gender',
    'age',
    'about',
    'skills',
    'photoUrl',
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};

module.exports = {
  validateSingUpData,
  validateProfileData,
};
