interface CreateFriendRequest {
  user_id: string;
  friend_id: string;
}

// Interface cho UpdateFriendRequest DTO
interface UpdateFriendRequest {
  status?: string;
}
