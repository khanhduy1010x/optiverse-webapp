

export interface SelectedFriend {
  id: string;
  displayName: string;
  avatar?: string;
}

export interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (groupId: string) => void;
}
