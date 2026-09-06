import React, { useState } from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

interface OfficialImageProps {
  src?: string;
  name: string;
  countryFlag?: string;
  size?: number;
  style?: ViewStyle;
}

export const OfficialImage: React.FC<OfficialImageProps> = ({
  src,
  name,
  countryFlag,
  size = 60,
  style,
}) => {
  const [hasError, setHasError] = useState(false);

  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'Ref'
  )}&background=0A162B&color=F59E0B&size=256&bold=true`;

  const finalSrc = hasError || !src ? fallbackUrl : src;
  const flagSize = Math.max(16, Math.round(size * 0.35));

  return (
    <View style={[{ width: size, height: size }, styles.wrapper, style]}>
      <Image
        source={{ uri: finalSrc }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        onError={() => setHasError(true)}
      />
      {countryFlag ? (
        <View
          style={[
            styles.flagContainer,
            {
              width: flagSize,
              height: flagSize,
              borderRadius: flagSize / 2,
            },
          ]}
        >
          <Image
            source={{ uri: countryFlag }}
            style={{ width: flagSize, height: flagSize, borderRadius: flagSize / 2 }}
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
  flagContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
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
  },
});
