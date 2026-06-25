import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_SIZES, wp } from '../styles/theme';
import { FONTS } from '../styles/typography';
import { useTheme } from '../theme';

const STEPS = ['Pending', 'Picking', 'Packed'];

const PipelineTracker = ({ currentStatus }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const activeIndex = Math.max(STEPS.indexOf(currentStatus), 0);

  return (
    <View>
      <View style={styles.trackRow}>
        {STEPS.map((step, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;
          const isFilled = isDone || isActive;

          return (
            <React.Fragment key={step}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isFilled ? colors.primary : colors.card,
                    borderColor: isFilled ? colors.primary : colors.border,
                  },
                ]}
              >
                {isDone && <Icon name="check" size={wp('2.6%')} color={colors.white} />}
              </View>
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: isDone ? colors.primary : colors.border },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <View style={styles.labelRow}>
        {STEPS.map((step, index) => (
          <Text
            key={step}
            style={[styles.label, index === activeIndex && styles.labelActive]}
          >
            {step}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default PipelineTracker;

const makeStyles = (colors) => StyleSheet.create({
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: wp('4.2%'),
    height: wp('4.2%'),
    borderRadius: wp('2.1%'),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    flex: 1,
    height: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    color: colors.textMuted,
    fontFamily: FONTS.openSans.regular,
  },
  labelActive: {
    color: colors.primary,
    fontFamily: FONTS.openSans.semiBold,
  },
});
