export type Friend = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
};

export type CreateWorkspaceModalProps = {
  isOpen: boolean;
  name: string;
  description?: string;
  hasPassword: boolean;
  password: string;
  searchQuery: string;
  friendResults: Friend[];
  selectedFriends: Friend[];
  onClose: () => void;
  onSubmit: () => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onToggleHasPassword: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Expect hook handlers to read e.currentTarget.dataset.id
  onAddFriend: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onRemoveFriend: (e: React.MouseEvent<HTMLButtonElement>) => void;
};
