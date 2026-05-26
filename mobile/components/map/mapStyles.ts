import { StyleSheet } from 'react-native';
import { Brand, Surfaces, Typography, Spacing, Radius } from '@/constants/Colors';

export const shared = StyleSheet.create({
  container: { flex: 1, backgroundColor: Surfaces.background },

  // Markers
  marker: {
    width: 44, height: 44, borderRadius: Radius.full,
    backgroundColor: Surfaces.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Surfaces.border,
  },
  markerSel: { borderColor: Brand.accent, borderWidth: 2, transform: [{ scale: 1.15 }] },
  markerDone: { borderColor: Brand.success, backgroundColor: '#F0FDF4' },
  chk: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Brand.success,
    alignItems: 'center', justifyContent: 'center',
  },

  // Top stats bar
  topBar: { position: 'absolute', left: 16, right: 154, zIndex: 10 },
  stats: {
    flexDirection: 'row', backgroundColor: Surfaces.background,
    borderRadius: Radius.md, paddingVertical: 10, paddingHorizontal: 16,
    alignItems: 'center', borderWidth: 1, borderColor: Surfaces.border,
  },
  si: { flex: 1, alignItems: 'center' },
  sv: { fontFamily: Typography.fonts.h3, fontSize: 18, color: Brand.primary },
  sl: {
    fontFamily: Typography.fonts.caption, fontSize: 10, color: Brand.secondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1,
  },
  divider: { width: 1, height: 28, backgroundColor: Surfaces.border },

  // Category filters
  filterC: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
  filterR: { paddingHorizontal: 16, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full, backgroundColor: Surfaces.background,
    borderWidth: 1, borderColor: Surfaces.border, gap: 6,
  },
  pillA: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  pillL: { fontFamily: Typography.fonts.bodySm, fontSize: 13, color: Brand.primary },
  pillLA: { color: Surfaces.background },

  // Recenter button
  recenter: {
    position: 'absolute', right: 16,
    width: 44, height: 44, borderRadius: Radius.full,
    backgroundColor: Surfaces.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Surfaces.border, zIndex: 10,
  },

  // Bottom card
  btmWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16 },
  btmCard: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Surfaces.border,
    alignSelf: 'center', marginTop: 12, marginBottom: 8,
  },
  cardH: { flexDirection: 'row', gap: 14 },
  cardIcon: {
    width: 48, height: 48, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  cardNR: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardN: { fontFamily: Typography.fonts.h3, fontSize: 18, color: Brand.primary },
  expB: {
    backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.sm, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  expBT: { fontFamily: Typography.fonts.caption, fontSize: 11, color: Brand.success },
  cardDesc: {
    fontFamily: Typography.fonts.bodySm, fontSize: 14,
    color: Brand.secondary, marginTop: 4, lineHeight: 20,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  catTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm },
  catTT: { fontFamily: Typography.fonts.caption, fontSize: 11, textTransform: 'capitalize' },
  radT: { fontFamily: Typography.fonts.bodySm, fontSize: 12, color: Brand.secondary },
  ptBadge: {
    backgroundColor: Surfaces.default, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.sm, marginLeft: 'auto',
    borderWidth: 1, borderColor: Surfaces.border,
  },
  ptText: { fontFamily: Typography.fonts.caption, fontSize: 12, color: Brand.primary },
  acts: { marginTop: 16 },
  actRow: { flexDirection: 'row', gap: 10 },
  infoBtn: {
    width: 48, height: 48, borderRadius: Radius.md,
    backgroundColor: Surfaces.background,
    borderWidth: 1, borderColor: Surfaces.border,
    alignItems: 'center', justifyContent: 'center',
  },
  unlockMsg: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 10,
  },
  unlockText: { fontFamily: Typography.fonts.h3, fontSize: 16, color: Brand.success },
  unlockErr: {
    fontFamily: Typography.fonts.caption, fontSize: 12,
    color: Brand.error, textAlign: 'center', marginTop: 8,
  },

  // Connection markers
  connMarker: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Surfaces.background,
    borderWidth: 2, borderColor: Brand.accent,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  connAvatar: { width: 36, height: 36, borderRadius: 18 },
  connDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Brand.success, borderWidth: 2, borderColor: Surfaces.background,
  },
});
