export const UserType = {
  SELLER: 'seller',
  BUYER: 'buyer',
};

const UserTypeManager = {
  getUserType: jest.fn(),
  setUserType: jest.fn(),
};

export default UserTypeManager;