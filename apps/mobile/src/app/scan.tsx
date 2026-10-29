import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { parseQr } from '@kagua/core';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { setState } from '../state/store';
import { useTheme } from '../theme/ThemeContext';
import { LIME } from '../theme/tokens';
import { GhostButton, PrimaryButton, RoundButton, Screen, Txt } from '../ui/kit';
import { goBack } from '../ui/nav';

export default function Scan() {
  const { t } = useTheme();
  const [permission, request] = useCameraPermissions();
  const [note, setNote] = useState('');
  const handled = useRef(false);

  const onScan = ({ data }: BarcodeScanningResult) => {
    if (handled.current) return;
    const target = parseQr(data);
    if (!target) {
      setNote("Can't tell: this QR has no single address to check.");
      return;
    }
    handled.current = true;
    // The QR fills the address and its network; the user still taps Kagua.
    setState({ draftAddress: target.address, picked: target.network });
    goBack();
  };

  return (
    <Screen style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <RoundButton icon={ArrowLeft01Icon} label="Back" onPress={goBack} />
        <Txt w={600} size={22} accessibilityRole="header" style={{ letterSpacing: -0.6 }}>
          Scan QR
        </Txt>
      </View>
      {!permission ? null : permission.granted ? (
        <View style={styles.frame}>
          <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onScan} />
          <View pointerEvents="none" style={[styles.reticle, { borderColor: LIME }]} />
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
          <Txt size={16} color={t.soft} style={{ lineHeight: 23 }}>
            Kagua needs the camera to read the QR. The image stays on this phone and is not saved.
          </Txt>
          <PrimaryButton label="Allow camera" onPress={request} />
          <GhostButton label="Type the address instead" onPress={goBack} />
        </View>
      )}
      <Txt size={14} color={note ? t.warnInk : t.muted} accessibilityLiveRegion="polite" style={{ textAlign: 'center', minHeight: 20 }}>
        {note || 'Point at the wallet QR. Kagua reads the address and you check it next.'}
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, borderRadius: 28, overflow: 'hidden', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  reticle: { width: 230, height: 230, borderRadius: 28, borderWidth: 3 },
});
