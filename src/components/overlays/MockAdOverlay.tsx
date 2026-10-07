import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMockAdPresenter } from '../../hooks/useAds';
import type { MockAdRequest } from '../../services/ads/mockAdService';
import { colors, spacing } from '../../theme';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { LogoMark } from '../ui/LogoMark';

const REWARDED_SECONDS = 5;
const INTERSTITIAL_SECONDS = 3;

/**
 * Development-only stand-in for a full-screen ad. A rewarded ad grants its reward only if
 * watched to the end; closing early returns no reward, just like a real network.
 */
const MockAd = ({
  request,
  finish,
}: {
  request: MockAdRequest;
  finish: (result: boolean) => void;
}) => {
  const [left, setLeft] = useState(
    request.kind === 'rewarded' ? REWARDED_SECONDS : INTERSTITIAL_SECONDS,
  );

  useEffect(() => {
    const timer = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const rewarded = request.kind === 'rewarded';
  const done = left === 0;

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={[StyleSheet.absoluteFill, styles.root]}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <AppText variant="caption" color={colors.textSecondary}>
            MOCK {rewarded ? 'REWARDED' : 'INTERSTITIAL'} AD · {request.placement}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {done ? 'Done' : `${left}s`}
          </AppText>
        </View>
        <View style={styles.center}>
          <LogoMark size={96} />
          <AppText variant="title" align="center">
            Your ad here
          </AppText>
          <AppText color={colors.textSecondary} align="center">
            Replace MockAdService with AdMobAdService to show real ads.
          </AppText>
        </View>
        <View style={styles.buttons}>
          {rewarded ? (
            <>
              <AppButton
                variant="primary"
                label={done ? 'Claim reward' : `Reward in ${left}s`}
                disabled={!done}
                onPress={() => finish(true)}
              />
              {!done ? (
                <AppButton
                  variant="ghost"
                  label="Close (no reward)"
                  onPress={() => finish(false)}
                />
              ) : null}
            </>
          ) : (
            <AppButton
              label={done ? 'Close' : `Close in ${left}s`}
              disabled={!done}
              onPress={() => finish(true)}
            />
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

export const MockAdOverlay = () => {
  const { request, finish } = useMockAdPresenter();
  return request ? <MockAd key={request.id} request={request} finish={finish} /> : null;
};

const styles = StyleSheet.create({
  root: { backgroundColor: '#1e0f07', zIndex: 100 },
  safe: { flex: 1, padding: spacing.xl },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  buttons: { gap: spacing.md },
});
