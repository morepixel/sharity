import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface SharriesPointsProps {
  points: number;
  level: {
    name: string;
    icon: string;
    nextLevel?: {
      name: string;
      pointsNeeded: number;
    };
  };
  onInfoPress: () => void;
}

export const SharriesPoints: React.FC<SharriesPointsProps> = ({
  points,
  level,
  onInfoPress
}) => {
  const getProgress = () => {
    if (!level.nextLevel) return 1;
    const currentLevelPoints = points;
    const nextLevelPoints = level.nextLevel.pointsNeeded;
    return Math.min(currentLevelPoints / nextLevelPoints, 1);
  };

  return (
    <View style={[styles.container, theme.shadows.sm]}>
      <View style={styles.header}>
        <Text style={styles.title}>Deine Sharries</Text>
        <TouchableOpacity onPress={onInfoPress}>
          <Ionicons 
            name="information-circle-outline" 
            size={24} 
            color={theme.colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: level.icon }}
          style={styles.levelIcon}
        />

        <View style={styles.pointsContainer}>
          <Text style={styles.points}>{points}</Text>
          <Text style={styles.label}>Sharries</Text>
        </View>

        <View style={styles.levelContainer}>
          <Text style={styles.levelName}>{level.name}</Text>
          {level.nextLevel && (
            <Text style={styles.nextLevel}>
              Noch {level.nextLevel.pointsNeeded - points} Punkte bis {level.nextLevel.name}
            </Text>
          )}
        </View>
      </View>

      {level.nextLevel && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${getProgress() * 100}%` }
              ]} 
            />
          </View>
        </View>
      )}

      <View style={styles.benefits}>
        <Text style={styles.benefitsTitle}>Deine Vorteile</Text>
        <View style={styles.benefitsList}>
          <BenefitItem
            icon="gift-outline"
            text="Artikel früher sehen"
            active={points >= 100}
          />
          <BenefitItem
            icon="star-outline"
            text="Premium-Status"
            active={points >= 500}
          />
          <BenefitItem
            icon="shield-checkmark-outline"
            text="Verifizierter Geber"
            active={points >= 1000}
          />
        </View>
      </View>
    </View>
  );
};

interface BenefitItemProps {
  icon: string;
  text: string;
  active: boolean;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text, active }) => (
  <View style={[styles.benefitItem, !active && styles.benefitItemInactive]}>
    <Ionicons
      name={icon as any}
      size={20}
      color={active ? theme.colors.primary : theme.colors.text.disabled}
    />
    <Text style={[
      styles.benefitText,
      !active && styles.benefitTextInactive
    ]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg
  },
  levelIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md
  },
  pointsContainer: {
    alignItems: 'center',
    marginRight: theme.spacing.lg
  },
  points: {
    ...theme.typography.h1,
    color: theme.colors.primary
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary
  },
  levelContainer: {
    flex: 1
  },
  levelName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  nextLevel: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary
  },
  progressContainer: {
    marginBottom: theme.spacing.lg
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4
  },
  benefits: {
    marginTop: theme.spacing.md
  },
  benefitsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md
  },
  benefitsList: {
    gap: theme.spacing.sm
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md
  },
  benefitItemInactive: {
    backgroundColor: theme.colors.surface
  },
  benefitText: {
    ...theme.typography.body1,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm
  },
  benefitTextInactive: {
    color: theme.colors.text.disabled
  }
});
