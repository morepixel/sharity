import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet
} from 'react-native';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { theme } from '../../theme';

interface ChatMessageProps {
  message: {
    content: string;
    createdAt: string;
    sender: {
      id: string;
      username: string;
      profileImage?: string;
    };
  };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isOwnMessage = message.sender.id === 'currentUserId';

  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownMessage : styles.otherMessage
    ]}>
      {!isOwnMessage && (
        <Image
          source={{ uri: message.sender.profileImage || 'default-profile-image' }}
          style={styles.avatar}
        />
      )}

      <View style={[
        styles.bubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble
      ]}>
        {!isOwnMessage && (
          <Text style={styles.username}>
            {message.sender.username}
          </Text>
        )}
        
        <Text style={[
          styles.content,
          isOwnMessage ? styles.ownContent : styles.otherContent
        ]}>
          {message.content}
        </Text>
        
        <Text style={[
          styles.time,
          isOwnMessage ? styles.ownTime : styles.otherTime
        ]}>
          {format(new Date(message.createdAt), 'HH:mm', { locale: de })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    maxWidth: '80%'
  },
  ownMessage: {
    alignSelf: 'flex-end'
  },
  otherMessage: {
    alignSelf: 'flex-start'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.xs
  },
  bubble: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm
  },
  ownBubble: {
    backgroundColor: theme.colors.primary
  },
  otherBubble: {
    backgroundColor: theme.colors.surface
  },
  username: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: 2
  },
  content: {
    ...theme.typography.body1
  },
  ownContent: {
    color: theme.colors.text.inverse
  },
  otherContent: {
    color: theme.colors.text.primary
  },
  time: {
    ...theme.typography.caption,
    alignSelf: 'flex-end',
    marginTop: 2
  },
  ownTime: {
    color: theme.colors.text.inverse
  },
  otherTime: {
    color: theme.colors.text.secondary
  }
});
