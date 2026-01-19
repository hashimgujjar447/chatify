export interface SelectedUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  isOnline: boolean | null;
  type: string | null;
}

export interface Chat {
  timestamp: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  dateSent?: string;
  messageType?: string;
  attachmentUrl?: string | null;
  isDeletedBySender?: boolean;
  isDeletedByReceiver?: boolean;
  isDeletedForEveryone?: boolean;
}

export interface GroupChat {
  id: string;
  senderId: string;
  groupId: string;
  message: string;
  createdAt: string;
  dateSent?: string;
  messageType: string;
  timestamp: string;
  attachmentUrl?: string | null;
  isDeletedForAll?: boolean;
  statuses: Array<{
    isDeleted: boolean;
    isSeen: boolean;
    deletedAt: string;
    user: { id: string };
  }>;
}
