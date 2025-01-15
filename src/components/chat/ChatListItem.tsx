import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { theme } from '../../theme';

interface ChatListItemProps {
  chat: {
    id: string;
    listing: {
      name: string;
      images: { url: string }[];
      status: string;
    };
    lastMessage: {
      content: string;
      createdAt: string;
      sender: {
        id: string;
      };
    };
    user1: {
      id: string;
      username: string;
      profileImage?: string;
    };
    user2: {
      id: string;
      username: string;
      profileImage?: string;
    };
  };
  onPress: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({ chat, onPress }) => {
  const otherUser = chat.user1.id === 'currentUserId' ? chat.user2 : chat.user1;
  const isGiven = chat.listing.status === 'given';

  return (
    <TouchableOpacity 
      style={[styles.container, theme.shadows.sm]} 
      onPress={onPress}
    >
      <Image
        source={{ uri: otherUser.profileImage || 'default-profile-image' }}
        style={styles.avatar}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username} numberOfLines={1}>
            {otherUser.username}
          </Text>
          <Text style={styles.time}>
            {format(new Date(chat.lastMessage.createdAt), 'HH:mm', { locale: de })}
          </Text>
        </View>

        <Text style={styles.listingName} numberOfLines={1}>
          {chat.listing.name}
          {isGiven && ' • Verschenkt'}
        </Text>

        <Text style={styles.lastMessage} numberOfLines={1}>
          {chat.lastMessage.sender.id === 'currentUserId' ? 'Du: ' : ''}
          {chat.lastMessage.content}
        </Text>
      </View>

      <Image
        source={{ uri: chat.listing.images[0].url }}
        style={styles.listingImage}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md
  },
  content: {
    flex: 1,
    marginRight: theme.spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs
  },
  username: {
    ...theme.typography.body1,
    fontWeight: '600',
    color: theme.colors.text.primary
  },
  time: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary
  },
  listingName: {
    ...theme.typography.body2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs
  },
  lastMessage: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary
  },
  listingImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm
  }
});
