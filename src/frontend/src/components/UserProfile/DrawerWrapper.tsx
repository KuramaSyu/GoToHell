import { UserProfileMain, UserProfileProps } from './Main';

export const UserProfileDesktopDrawer: React.FC<UserProfileProps> = ({
  user,
}) => {
  return <UserProfileMain user={user}></UserProfileMain>;
};
