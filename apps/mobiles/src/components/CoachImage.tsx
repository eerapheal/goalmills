import React, { useState } from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

interface CoachImageProps {
  src?: string;
  name: string;
  countryFlag?: string;
  clubLogo?: string;
  size?: number;
  style?: ViewStyle;
}

export const CoachImage: React.FC<CoachImageProps> = ({
  src,
  name,
  countryFlag,
  clubLogo,
  size = 64,
  style,
}) => {
  const [hasError, setHasError] = useState(false);

  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'Coach'
  )}&background=0A162B&color=38BDF8&size=256&bold=true`;

  const finalSrc = hasError || !src ? fallbackUrl : src;
  const badgeSize = Math.max(18, Math.round(size * 0.35));
  const borderRadius = Math.round(size * 0.28);

  return (
    <View style={[{ width: size, height: size }, styles.wrapper, style]}>
      <View
        style={[
          styles.imageContainer,
          { width: size, height: size, borderRadius },
        ]}
      >
        <Image
          source={{ uri: finalSrc }}
          style={{ width: size, height: size, borderRadius }}
          onError={() => setHasError(true)}
        />
      </View>

      {clubLogo ? (
        <View
          style={[
            styles.badgeContainer,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          <Image
            source={{ uri: clubLogo }}
            style={{ width: badgeSize - 4, height: badgeSize - 4 }}
            resizeMode="contain"
          />
        </View>
      ) : countryFlag ? (
        <View
          style={[
            styles.badgeContainer,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          <Image
            source={{ uri: countryFlag }}
            style={{ width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#070D18',
    borderWidth: 1.5,
    borderColor: '#070D18',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    padding: 1,
  },
});
