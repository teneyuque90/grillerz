import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { grillerzApi } from '../../api/grillerzApi';
import { AppChip } from '../../components/ui/AppChip';
import { BottomNav } from '../../components/ui/BottomNav';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ReliableImage } from '../../components/ui/ReliableImage';
import { ReliableImageBackground } from '../../components/ui/ReliableImageBackground';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { OFFLINE_DEMO_MODE } from '../../config/api';
import { getFallbackChefPackages } from '../../data/chefPackages';
import { getLocalAvatarUriByChef, getLocalCoverUriByChef, getLocalGalleryUriByChef, getLocalVideoThumbUri } from '../../data/localMedia';
import { getGrillerVideos, getYouTubeThumbnail } from '../../data/mediaLibrary';
import { RootStackParamList } from '../../navigation/screenConfig';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { Chef, ChefPackage, ChefVideo } from '../../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

type VideoDraft = {
  id: string;
  title: string;
  subtitle: string;
  youtubeUrl: string;
};

type PackageDraft = {
  id: string;
  name: string;
  details: string;
  price: string;
  isActive: boolean;
};

type ProfileDraft = {
  name: string;
  title: string;
  city: string;
  avatarUrl: string;
  coverUrl: string;
  galleryText: string;
  basePrice: string;
  bio: string;
  specialtiesText: string;
};

const roleLabel: Record<'client' | 'griller' | 'admin', string> = {
  client: 'Cliente',
  griller: 'Griller',
  admin: 'Admin'
};

const weekdayOptions = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mie' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sab' }
] as const;

const quickTimes = ['12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM', '10:00 PM'];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function buildDraftId() {
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function toVideoDraft(videos: ChefVideo[]): VideoDraft[] {
  return videos.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    youtubeUrl: item.youtubeUrl
  }));
}

function toPackageDraft(packages: ChefPackage[]): PackageDraft[] {
  return packages.map((item) => ({
    id: item.id,
    name: item.name,
    details: item.details,
    price: String(item.price),
    isActive: item.isActive
  }));
}

function toProfileDraft(chef: Chef): ProfileDraft {
  return {
    name: chef.name,
    title: chef.title,
    city: chef.city,
    avatarUrl: chef.avatarUrl,
    coverUrl: chef.coverUrl,
    galleryText: chef.gallery.join(', '),
    basePrice: String(chef.basePrice),
    bio: chef.bio,
    specialtiesText: chef.specialties.join(', ')
  };
}

function parseCommaList(input: string): string[] {
  return input
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function parseTimes(input: string): string[] {
  return input
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 16);
}

function parseDateKeys(input: string): string[] {
  const validDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  const items = input
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => validDatePattern.test(item))
    .slice(0, 40);

  return Array.from(new Set(items)).sort();
}

function parseSpecialDatesInput(input: string): Array<{ date: string; times: string[] }> {
  const validDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  const rows = input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 24);

  const parsed = rows
    .map((row) => {
      const separatorIndex = row.indexOf(':');
      if (separatorIndex === -1) {
        return { date: '', times: [] as string[] };
      }

      const date = row.slice(0, separatorIndex).trim();
      const timesRaw = row.slice(separatorIndex + 1);
      const times = timesRaw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 16);

      return { date, times: Array.from(new Set(times)) };
    })
    .filter((item) => validDatePattern.test(item.date) && item.times.length > 0);

  const byDate = new Map<string, { date: string; times: string[] }>();
  parsed.forEach((item) => {
    byDate.set(item.date, item);
  });

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function formatSpecialDatesInput(value: Array<{ date: string; times: string[] }> | undefined): string {
  if (!value || value.length === 0) {
    return '';
  }

  return value
    .map((item) => `${item.date}: ${item.times.join(', ')}`)
    .join('\n');
}

function parseGalleryUrls(input: string): string[] {
  return input
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function looksLikeLocalMedia(uri: string): boolean {
  const value = uri.trim().toLowerCase();
  return value.startsWith('file://') || value.startsWith('content://');
}

function extractYouTubeVideoId(rawInput: string): string {
  const input = rawInput.trim();
  if (!input) {
    return '';
  }

  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;

  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] ?? '';
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const directId = url.searchParams.get('v')?.trim();
      if (directId) {
        return directId;
      }

      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        return parts[1] ?? '';
      }
    }
  } catch {
    return '';
  }

  return '';
}

function applyChefPatch(chef: Chef, patch: Partial<Chef>): Chef {
  return {
    ...chef,
    ...patch,
    stats: {
      ...chef.stats,
      ...(patch.stats ?? {})
    }
  };
}

export function Account({ navigation }: Props) {
  const { authUser, chefs, selectedChef, replaceChef } = useAppState();
  const userName = authUser?.name ?? 'Usuario Grillerz';
  const userEmail = authUser?.email ?? 'guest@grillerz.app';
  const userPhone = authUser?.phone ?? '+52 867 000 0000';
  const userRole = authUser?.role ?? 'client';
  const userRoleLabel = roleLabel[userRole];

  const manageableChefs = useMemo(() => {
    if (userRole === 'admin') {
      return chefs;
    }

    if (userRole === 'griller') {
      const managedChefId = authUser?.managedChefId;
      if (!managedChefId) {
        return [];
      }

      return chefs.filter((item) => item.id === managedChefId);
    }

    return [];
  }, [authUser?.managedChefId, chefs, userRole]);

  const canManagePanel = userRole === 'admin' || userRole === 'griller';
  const [managedChefId, setManagedChefId] = useState(selectedChef.id);
  const managedChef = useMemo(() => chefs.find((item) => item.id === managedChefId) ?? null, [chefs, managedChefId]);

  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(managedChef ? toProfileDraft(managedChef) : null);
  const [availabilityWeekdays, setAvailabilityWeekdays] = useState<number[]>(managedChef?.availability?.weekdays ?? []);
  const [availabilityTimesText, setAvailabilityTimesText] = useState((managedChef?.availability?.times ?? []).join(', '));
  const [blockedDatesText, setBlockedDatesText] = useState((managedChef?.availability?.blockedDates ?? []).join(', '));
  const [specialDatesText, setSpecialDatesText] = useState(formatSpecialDatesInput(managedChef?.availability?.specialDates));

  const [videoDraft, setVideoDraft] = useState<VideoDraft[]>([]);
  const [packagesDraft, setPackagesDraft] = useState<PackageDraft[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [isSavingVideos, setIsSavingVideos] = useState(false);
  const [isSavingPackages, setIsSavingPackages] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [panelNotice, setPanelNotice] = useState<string | null>(null);
  const [quickVideoUrl, setQuickVideoUrl] = useState('');
  const [quickVideoTitle, setQuickVideoTitle] = useState('');
  const [quickVideoSubtitle, setQuickVideoSubtitle] = useState('');

  useEffect(() => {
    if (manageableChefs.length === 0) {
      return;
    }

    const hasCurrentManagedChef = manageableChefs.some((item) => item.id === managedChefId);
    if (!hasCurrentManagedChef) {
      setManagedChefId(manageableChefs[0].id);
    }
  }, [manageableChefs, managedChefId]);

  useEffect(() => {
    if (!managedChef) {
      setProfileDraft(null);
      setAvailabilityWeekdays([]);
      setAvailabilityTimesText('');
      return;
    }

    setProfileDraft(toProfileDraft(managedChef));
    setAvailabilityWeekdays(managedChef.availability?.weekdays ?? [1, 2, 3, 4, 5, 6, 0]);
    setAvailabilityTimesText((managedChef.availability?.times ?? ['6:00 PM']).join(', '));
    setBlockedDatesText((managedChef.availability?.blockedDates ?? []).join(', '));
    setSpecialDatesText(formatSpecialDatesInput(managedChef.availability?.specialDates));
    setQuickVideoUrl('');
    setQuickVideoTitle('');
    setQuickVideoSubtitle('');
    setPanelNotice(null);
  }, [managedChef]);

  useEffect(() => {
    let active = true;

    if (!canManagePanel || !managedChef) {
      setVideoDraft([]);
      setIsLoadingVideos(false);
      return () => {
        active = false;
      };
    }

    const chefId = managedChef.id;
    setIsLoadingVideos(true);

    if (OFFLINE_DEMO_MODE) {
      setVideoDraft(toVideoDraft(getGrillerVideos(chefId)));
      setIsLoadingVideos(false);
      return () => {
        active = false;
      };
    }

    async function loadChefVideos() {
      try {
        const remoteVideos = await grillerzApi.getChefVideos(chefId);
        if (active) {
          setVideoDraft(toVideoDraft(remoteVideos));
        }
      } catch {
        if (active) {
          setVideoDraft(toVideoDraft(getGrillerVideos(chefId)));
        }
      } finally {
        if (active) {
          setIsLoadingVideos(false);
        }
      }
    }

    void loadChefVideos();

    return () => {
      active = false;
    };
  }, [canManagePanel, managedChef]);

  const parsedGallery = useMemo(() => parseGalleryUrls(profileDraft?.galleryText ?? ''), [profileDraft?.galleryText]);
  const quickVideoId = useMemo(() => extractYouTubeVideoId(quickVideoUrl), [quickVideoUrl]);
  const quickVideoPreviewUrl = quickVideoId ? getYouTubeThumbnail(quickVideoId) : '';
  const quickVideoIsDuplicate = useMemo(() => {
    if (!quickVideoId) {
      return false;
    }

    return videoDraft.some((item) => extractYouTubeVideoId(item.youtubeUrl) === quickVideoId);
  }, [quickVideoId, videoDraft]);
  const avatarPreviewUri = profileDraft?.avatarUrl?.trim() || (managedChef ? getLocalAvatarUriByChef(managedChef.id) : '');
  const coverPreviewUri = profileDraft?.coverUrl?.trim() || (managedChef ? getLocalCoverUriByChef(managedChef.id) : '');

  function appendGalleryImage(uri: string) {
    setProfileDraft((prev) => {
      if (!prev) {
        return prev;
      }

      const list = parseGalleryUrls(prev.galleryText);
      if (list.length >= 12) {
        setPanelNotice('Maximo 12 imagenes para menu visual.');
        return prev;
      }

      return {
        ...prev,
        galleryText: [...list, uri].join(', ')
      };
    });
  }

  function removeGalleryImage(indexToRemove: number) {
    setProfileDraft((prev) => {
      if (!prev) {
        return prev;
      }

      const next = parseGalleryUrls(prev.galleryText).filter((_, index) => index !== indexToRemove);
      return {
        ...prev,
        galleryText: next.join(', ')
      };
    });
  }

  async function pickImage(field: 'avatarUrl' | 'coverUrl' | 'gallery') {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPanelNotice('Debes permitir acceso a tus fotos para subir imagenes.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        setPanelNotice('Imagen demasiado pesada. Usa una menor a 5MB.');
        return;
      }

      if (field === 'gallery') {
        appendGalleryImage(asset.uri);
        setPanelNotice('Imagen agregada al menu visual.');
        return;
      }

      setProfileDraft((prev) => (prev ? { ...prev, [field]: asset.uri } : prev));
      setPanelNotice(field === 'avatarUrl' ? 'Avatar actualizado.' : 'Portada actualizada.');
    } catch {
      setPanelNotice('No se pudo abrir la galeria en este momento.');
    }
  }

  useEffect(() => {
    let active = true;

    if (!canManagePanel || !managedChef) {
      setPackagesDraft([]);
      setIsLoadingPackages(false);
      return () => {
        active = false;
      };
    }

    const chefId = managedChef.id;
    setIsLoadingPackages(true);

    if (OFFLINE_DEMO_MODE) {
      setPackagesDraft(toPackageDraft(getFallbackChefPackages(chefId)));
      setIsLoadingPackages(false);
      return () => {
        active = false;
      };
    }

    async function loadChefPackages() {
      try {
        const remotePackages = await grillerzApi.getChefPackages(chefId);
        if (active) {
          setPackagesDraft(toPackageDraft(remotePackages));
        }
      } catch {
        if (active) {
          setPackagesDraft(toPackageDraft(getFallbackChefPackages(chefId)));
        }
      } finally {
        if (active) {
          setIsLoadingPackages(false);
        }
      }
    }

    void loadChefPackages();

    return () => {
      active = false;
    };
  }, [canManagePanel, managedChef]);

  function toggleWeekday(day: number) {
    setAvailabilityWeekdays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((item) => item !== day);
      }

      return [...prev, day].sort((a, b) => a - b);
    });
  }

  function addQuickTime(timeValue: string) {
    const current = parseTimes(availabilityTimesText);
    if (current.includes(timeValue)) {
      return;
    }

    const nextTimes = [...current, timeValue];
    setAvailabilityTimesText(nextTimes.join(', '));
  }

  function updateDraftVideo(id: string, key: 'title' | 'subtitle' | 'youtubeUrl', value: string) {
    setVideoDraft((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          [key]: value
        };
      })
    );
  }

  function updateDraftPackage(id: string, key: keyof PackageDraft, value: string | boolean) {
    setPackagesDraft((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          [key]: value
        };
      })
    );
  }

  function addPackageDraft() {
    if (packagesDraft.length >= 20) {
      setPanelNotice('Maximo 20 paquetes por griller.');
      return;
    }

    setPackagesDraft((prev) => [
      ...prev,
      {
        id: buildDraftId(),
        name: '',
        details: '',
        price: '',
        isActive: true
      }
    ]);
  }

  function removePackageDraft(id: string) {
    setPackagesDraft((prev) => prev.filter((item) => item.id !== id));
  }

  function addVideoDraft() {
    if (videoDraft.length >= 12) {
      setPanelNotice('Maximo 12 videos por griller.');
      return;
    }

    setVideoDraft((prev) => [
      ...prev,
      {
        id: buildDraftId(),
        title: '',
        subtitle: '',
        youtubeUrl: ''
      }
    ]);
  }

  function addQuickVideoDraft() {
    if (videoDraft.length >= 12) {
      setPanelNotice('Maximo 12 videos por griller.');
      return;
    }

    if (!quickVideoId) {
      setPanelNotice('Pega un link valido de YouTube para agregar el video.');
      return;
    }

    if (quickVideoIsDuplicate) {
      setPanelNotice('Ese video ya esta agregado en tu lista.');
      return;
    }

    const title = quickVideoTitle.trim() || `Video destacado #${videoDraft.length + 1}`;
    const subtitle = quickVideoSubtitle.trim() || 'Video del griller';
    const youtubeUrl = `https://www.youtube.com/watch?v=${quickVideoId}`;

    setVideoDraft((prev) => [
      {
        id: buildDraftId(),
        title,
        subtitle,
        youtubeUrl
      },
      ...prev
    ]);

    setQuickVideoUrl('');
    setQuickVideoTitle('');
    setQuickVideoSubtitle('');
    setPanelNotice('Video agregado. No olvides presionar "Guardar videos".');
  }

  function removeVideoDraft(id: string) {
    setVideoDraft((prev) => prev.filter((item) => item.id !== id));
  }

  async function saveProfile() {
    if (isSavingProfile || !managedChef || !profileDraft) {
      return;
    }

    const specialties = parseCommaList(profileDraft.specialtiesText);
    if (specialties.length === 0) {
      setPanelNotice('Agrega al menos una especialidad o platillo.');
      return;
    }

    const parsedPrice = Number(profileDraft.basePrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 500) {
      setPanelNotice('El precio base debe ser mayor o igual a $500 MXN.');
      return;
    }

    setIsSavingProfile(true);
    setPanelNotice(null);

    const payload = {
      name: profileDraft.name.trim(),
      title: profileDraft.title.trim(),
      city: profileDraft.city.trim(),
      basePrice: Math.round(parsedPrice),
      bio: profileDraft.bio.trim(),
      specialties,
      avatarUrl: profileDraft.avatarUrl.trim(),
      coverUrl: profileDraft.coverUrl.trim(),
      gallery: parseGalleryUrls(profileDraft.galleryText)
    };

    const hasLocalMedia = [payload.avatarUrl, payload.coverUrl, ...payload.gallery].some((item) => looksLikeLocalMedia(item));

    if (!payload.name || !payload.title || !payload.city || !payload.bio) {
      setPanelNotice('Completa nombre, titulo, ciudad y bio antes de guardar.');
      setIsSavingProfile(false);
      return;
    }

    try {
      if (OFFLINE_DEMO_MODE) {
        const nextChef = applyChefPatch(managedChef, {
          ...payload,
          gallery: payload.gallery.length > 0 ? payload.gallery : managedChef.gallery
        });
        replaceChef(nextChef);
      } else {
        const updatedChef = await grillerzApi.updateChefProfile(managedChef.id, payload);
        replaceChef(updatedChef);
      }

      if (!OFFLINE_DEMO_MODE && hasLocalMedia) {
        setPanelNotice('Perfil guardado. Nota: imagenes locales solo funcionan en este dispositivo; para produccion usa URLs publicas.');
      } else {
        setPanelNotice('Perfil del griller actualizado.');
      }
    } catch (error) {
      setPanelNotice(error instanceof Error ? error.message : 'No se pudo guardar el perfil.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function saveAvailability() {
    if (isSavingAvailability || !managedChef) {
      return;
    }

    const times = parseTimes(availabilityTimesText);
    const blockedDates = parseDateKeys(blockedDatesText);
    const specialDates = parseSpecialDatesInput(specialDatesText);
    if (availabilityWeekdays.length === 0 || times.length === 0) {
      setPanelNotice('Selecciona al menos un dia y un horario para la agenda.');
      return;
    }

    setIsSavingAvailability(true);
    setPanelNotice(null);

    try {
      if (OFFLINE_DEMO_MODE) {
        const nextChef = applyChefPatch(managedChef, {
          availability: {
            weekdays: availabilityWeekdays,
            times,
            blockedDates,
            specialDates
          }
        });
        replaceChef(nextChef);
      } else {
        const updatedChef = await grillerzApi.updateChefAvailability(managedChef.id, {
          weekdays: availabilityWeekdays,
          times,
          blockedDates,
          specialDates
        });
        replaceChef(updatedChef);
      }

      setPanelNotice('Agenda del griller actualizada.');
    } catch (error) {
      setPanelNotice(error instanceof Error ? error.message : 'No se pudo guardar la agenda.');
    } finally {
      setIsSavingAvailability(false);
    }
  }

  async function saveVideos() {
    if (isSavingVideos || !managedChef) {
      return;
    }

    const payloadVideos = videoDraft
      .map((item) => ({
        title: item.title.trim(),
        subtitle: item.subtitle.trim(),
        youtubeUrl: item.youtubeUrl.trim()
      }))
      .filter((item) => item.title && item.youtubeUrl);

    if (payloadVideos.length === 0) {
      setPanelNotice('Agrega al menos un video con titulo y link de YouTube.');
      return;
    }

    setIsSavingVideos(true);
    setPanelNotice(null);

    try {
      if (OFFLINE_DEMO_MODE) {
        setPanelNotice('Modo offline: videos guardados solo en esta sesion de demo.');
      } else {
        const savedVideos = await grillerzApi.updateChefVideos(managedChef.id, {
          videos: payloadVideos
        });
        setVideoDraft(toVideoDraft(savedVideos));
        setPanelNotice('Videos del perfil guardados.');
      }
    } catch (error) {
      setPanelNotice(error instanceof Error ? error.message : 'No se pudieron guardar los videos.');
    } finally {
      setIsSavingVideos(false);
    }
  }

  async function savePackages() {
    if (isSavingPackages || !managedChef) {
      return;
    }

    const payloadPackages = packagesDraft
      .map((item) => ({
        name: item.name.trim(),
        details: item.details.trim(),
        price: Number(item.price),
        isActive: item.isActive
      }))
      .filter((item) => item.name && Number.isFinite(item.price) && item.price >= 500);

    if (payloadPackages.length === 0) {
      setPanelNotice('Agrega al menos un paquete con nombre y precio valido (>= 500).');
      return;
    }

    setIsSavingPackages(true);
    setPanelNotice(null);

    try {
      if (OFFLINE_DEMO_MODE) {
        setPanelNotice('Modo offline: paquetes guardados solo en esta sesion de demo.');
      } else {
        const savedPackages = await grillerzApi.updateChefPackages(managedChef.id, {
          packages: payloadPackages
        });
        setPackagesDraft(toPackageDraft(savedPackages));
        setPanelNotice('Paquetes del griller guardados.');
      }
    } catch (error) {
      setPanelNotice(error instanceof Error ? error.message : 'No se pudieron guardar los paquetes.');
    } finally {
      setIsSavingPackages(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader
            title="Cuenta"
            onBack={() => navigation.goBack()}
            rightAction="Ajustes"
            onRightAction={() => navigation.navigate('Settings')}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.profileCard}>
              <View style={styles.avatar} />
              <View style={styles.profileBody}>
                <Text style={styles.profileName}>{userName}</Text>
                <Text style={styles.profileEmail}>{userEmail}</Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{userRoleLabel}</Text>
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Informacion de cuenta</Text>
              <Field label="Nombre" value={userName} />
              <Field label="Telefono" value={userPhone} />
              <Field label="Correo" value={userEmail} />
              <Field label="Rol" value={userRoleLabel} />
              {userRole === 'griller' ? (
                <Field
                  label="Perfil griller asignado"
                  value={chefs.find((item) => item.id === authUser?.managedChefId)?.name ?? authUser?.managedChefId ?? 'Sin asignar'}
                />
              ) : null}
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Panel Griller</Text>
              {canManagePanel && manageableChefs.length > 0 ? (
                <>
                  <Text style={styles.panelHint}>
                    Admin y Griller pueden actualizar perfil, imagenes (avatar, portada, menu visual), menu, agenda y videos del perfil publico.
                  </Text>

                  {userRole === 'admin' ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chefsRow}>
                      {manageableChefs.map((item) => {
                        const isActive = item.id === managedChefId;
                        return (
                          <Pressable key={item.id} style={[styles.chefChip, isActive ? styles.chefChipActive : null]} onPress={() => setManagedChefId(item.id)}>
                            <Text style={[styles.chefChipLabel, isActive ? styles.chefChipLabelActive : null]}>{item.name}</Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  ) : null}

                  {managedChef && profileDraft ? (
                    <>
                      <View style={styles.subBlock}>
                        <Text style={styles.subBlockTitle}>Perfil del griller</Text>
                        <Text style={styles.panelHint}>Edita tu portada, avatar y menu visual en 1 minuto. Recomendado: avatar 1024x1024, portada 1600x900.</Text>

                        <View style={styles.mediaTemplateCard}>
                          <ReliableImageBackground
                            uri={coverPreviewUri}
                            fallbackUri={managedChef ? getLocalCoverUriByChef(managedChef.id) : ''}
                            style={styles.coverPreview}
                            imageStyle={styles.coverPreviewImage}
                          >
                            <View style={styles.coverPreviewShade} />
                          </ReliableImageBackground>

                          <View style={styles.avatarPreviewWrap}>
                            <ReliableImage
                              uri={avatarPreviewUri}
                              fallbackUri={managedChef ? getLocalAvatarUriByChef(managedChef.id) : ''}
                              style={styles.avatarPreview}
                            />
                          </View>

                          <View style={styles.mediaActionsRow}>
                            <Pressable style={styles.quickActionButton} onPress={() => void pickImage('avatarUrl')}>
                              <MaterialCommunityIcons name="camera-outline" size={14} color={colors.primaryDark} />
                              <Text style={styles.quickActionLabel}>Cambiar avatar</Text>
                            </Pressable>
                            <Pressable style={styles.quickActionButton} onPress={() => void pickImage('coverUrl')}>
                              <MaterialCommunityIcons name="image-outline" size={14} color={colors.primaryDark} />
                              <Text style={styles.quickActionLabel}>Cambiar portada</Text>
                            </Pressable>
                          </View>
                        </View>

                        <View style={styles.galleryQuickBlock}>
                          <View style={styles.galleryQuickHeader}>
                            <Text style={styles.helperText}>Menu visual (recomendado 1200x800, max 12 fotos)</Text>
                            <Pressable style={styles.galleryAddButton} onPress={() => void pickImage('gallery')}>
                              <Text style={styles.galleryAddLabel}>+ Agregar foto</Text>
                            </Pressable>
                          </View>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryQuickRow}>
                            {parsedGallery.length > 0 ? (
                              parsedGallery.map((uri, index) => (
                                <View key={`${uri}-${index}`} style={styles.galleryQuickCard}>
                                  <ReliableImage
                                    uri={uri}
                                    fallbackUri={managedChef ? getLocalGalleryUriByChef(managedChef.id, index) : ''}
                                    style={styles.galleryQuickImage}
                                  />
                                  <Pressable style={styles.galleryRemoveButton} onPress={() => removeGalleryImage(index)}>
                                    <MaterialCommunityIcons name="close" size={12} color="#FFFFFF" />
                                  </Pressable>
                                </View>
                              ))
                            ) : (
                              <View style={styles.galleryEmptyCard}>
                                <Text style={styles.galleryEmptyText}>Agrega fotos para mostrar tus cortes y paquetes.</Text>
                              </View>
                            )}
                          </ScrollView>
                        </View>

                        <TextInput
                          value={profileDraft.name}
                          onChangeText={(value) => setProfileDraft((prev) => (prev ? { ...prev, name: value } : prev))}
                          placeholder="Nombre"
                          placeholderTextColor={colors.textSoft}
                          style={styles.input}
                        />
                        <TextInput
                          value={profileDraft.title}
                          onChangeText={(value) => setProfileDraft((prev) => (prev ? { ...prev, title: value } : prev))}
                          placeholder="Titulo profesional"
                          placeholderTextColor={colors.textSoft}
                          style={styles.input}
                        />
                        <TextInput
                          value={profileDraft.city}
                          onChangeText={(value) => setProfileDraft((prev) => (prev ? { ...prev, city: value } : prev))}
                          placeholder="Ciudad"
                          placeholderTextColor={colors.textSoft}
                          style={styles.input}
                        />
                        <TextInput
                          value={profileDraft.avatarUrl}
                          onChangeText={(value) => setProfileDraft((prev) => (prev ? { ...prev, avatarUrl: value } : prev))}
                          placeholder="URL imagen de perfil (avatar)"
                          placeholderTextColor={colors.textSoft}
                          style={styles.input}
                          autoCapitalize="none"
                        />
                        <TextInput
                          value={profileDraft.coverUrl}
                          onChangeText={(value) => setProfileDraft((prev) => (prev ? { ...prev, coverUrl: value } : prev))}
                          placeholder="URL imagen de portada (banner)"
                          placeholderTextColor={colors.textSoft}
                          style={styles.input}
                          autoCapitalize="none"
                        />
                        <TextInput
                          value={profileDraft.galleryText}
                          onChangeText={(value) => setProfileDraft((prev) => (prev ? { ...prev, galleryText: value } : prev))}
                          placeholder="URLs del menu visual (separadas por coma)"
                          placeholderTextColor={colors.textSoft}
                          style={[styles.input, styles.textArea]}
                          multiline
                          autoCapitalize="none"
                        />
                        <TextInput
                          value={profileDraft.basePrice}
                          onChangeText={(value) => setProfileDraft((prev) => (prev ? { ...prev, basePrice: value } : prev))}
                          placeholder="Precio base (MXN)"
                          placeholderTextColor={colors.textSoft}
                          keyboardType="numeric"
                          style={styles.input}
                        />
                        <TextInput
                          value={profileDraft.specialtiesText}
                          onChangeText={(value) => setProfileDraft((prev) => (prev ? { ...prev, specialtiesText: value } : prev))}
                          placeholder="Platillos o especialidades (separados por coma)"
                          placeholderTextColor={colors.textSoft}
                          style={[styles.input, styles.textArea]}
                          multiline
                        />
                        <TextInput
                          value={profileDraft.bio}
                          onChangeText={(value) => setProfileDraft((prev) => (prev ? { ...prev, bio: value } : prev))}
                          placeholder="Descripcion del griller"
                          placeholderTextColor={colors.textSoft}
                          style={[styles.input, styles.textAreaLarge]}
                          multiline
                        />
                        <PrimaryButton
                          label={isSavingProfile ? 'Guardando perfil...' : 'Guardar perfil y platillos'}
                          compact
                          onPress={() => {
                            void saveProfile();
                          }}
                        />
                      </View>

                      <View style={styles.subBlock}>
                        <Text style={styles.subBlockTitle}>Agenda y horarios</Text>
                        <Text style={styles.helperText}>Dias disponibles</Text>
                        <View style={styles.daysWrap}>
                          {weekdayOptions.map((day) => (
                            <AppChip
                              key={day.value}
                              label={day.label}
                              selected={availabilityWeekdays.includes(day.value)}
                              onPress={() => toggleWeekday(day.value)}
                            />
                          ))}
                        </View>

                        <Text style={styles.helperText}>Horarios disponibles</Text>
                        <TextInput
                          value={availabilityTimesText}
                          onChangeText={setAvailabilityTimesText}
                          placeholder="Ejemplo: 2:00 PM, 5:00 PM, 8:00 PM"
                          placeholderTextColor={colors.textSoft}
                          style={[styles.input, styles.textArea]}
                          multiline
                        />

                        <View style={styles.quickTimesWrap}>
                          {quickTimes.map((timeValue) => (
                            <Pressable key={timeValue} style={styles.quickTime} onPress={() => addQuickTime(timeValue)}>
                              <Text style={styles.quickTimeText}>{timeValue}</Text>
                            </Pressable>
                          ))}
                        </View>

                        <Text style={styles.helperText}>Fechas bloqueadas (YYYY-MM-DD)</Text>
                        <TextInput
                          value={blockedDatesText}
                          onChangeText={setBlockedDatesText}
                          placeholder="Ejemplo: 2026-04-26, 2026-05-03"
                          placeholderTextColor={colors.textSoft}
                          style={[styles.input, styles.textArea]}
                          multiline
                          autoCapitalize="none"
                        />

                        <Text style={styles.helperText}>Horarios especiales por fecha</Text>
                        <Text style={styles.helperMuted}>Formato por linea: 2026-05-01: 1:00 PM, 4:00 PM</Text>
                        <TextInput
                          value={specialDatesText}
                          onChangeText={setSpecialDatesText}
                          placeholder="2026-05-01: 12:00 PM, 2:00 PM"
                          placeholderTextColor={colors.textSoft}
                          style={[styles.input, styles.textAreaLarge]}
                          multiline
                          autoCapitalize="none"
                        />

                        <PrimaryButton
                          label={isSavingAvailability ? 'Guardando agenda...' : 'Guardar agenda'}
                          compact
                          onPress={() => {
                            void saveAvailability();
                          }}
                        />
                      </View>

                      <View style={styles.subBlock}>
                        <Text style={styles.subBlockTitle}>Solicitudes y pedidos</Text>
                        <Text style={styles.panelHint}>Acepta o rechaza reservas pendientes desde la bandeja del griller.</Text>
                        <PrimaryButton
                          label="Ir a solicitudes de reserva"
                          compact
                          onPress={() => navigation.navigate('Bookings')}
                        />
                      </View>

                      <View style={styles.subBlock}>
                        <Text style={styles.subBlockTitle}>Paquetes y menu</Text>
                        <Text style={styles.panelHint}>Configura los paquetes que vera el cliente al visitar tu perfil.</Text>
                        {isLoadingPackages ? (
                          <View style={styles.loadingRow}>
                            <ActivityIndicator color={colors.primary} />
                            <Text style={styles.loadingText}>Cargando paquetes...</Text>
                          </View>
                        ) : (
                          <View style={styles.videoEditorList}>
                            {packagesDraft.map((item, index) => (
                              <View key={item.id} style={styles.videoEditorCard}>
                                <View style={styles.videoEditorHeader}>
                                  <Text style={styles.videoEditorTitle}>Paquete {index + 1}</Text>
                                  <Pressable onPress={() => removePackageDraft(item.id)}>
                                    <Text style={styles.removeVideo}>Eliminar</Text>
                                  </Pressable>
                                </View>
                                <TextInput
                                  value={item.name}
                                  onChangeText={(value) => updateDraftPackage(item.id, 'name', value)}
                                  placeholder="Nombre del paquete"
                                  placeholderTextColor={colors.textSoft}
                                  style={styles.input}
                                />
                                <TextInput
                                  value={item.details}
                                  onChangeText={(value) => updateDraftPackage(item.id, 'details', value)}
                                  placeholder="Detalle del paquete"
                                  placeholderTextColor={colors.textSoft}
                                  style={styles.input}
                                />
                                <TextInput
                                  value={item.price}
                                  onChangeText={(value) => updateDraftPackage(item.id, 'price', value)}
                                  placeholder="Precio en MXN"
                                  placeholderTextColor={colors.textSoft}
                                  style={styles.input}
                                  keyboardType="numeric"
                                />
                                <Pressable
                                  style={styles.quickTime}
                                  onPress={() => updateDraftPackage(item.id, 'isActive', !item.isActive)}
                                >
                                  <Text style={styles.quickTimeText}>{item.isActive ? 'Visible al cliente' : 'Oculto al cliente'}</Text>
                                </Pressable>
                              </View>
                            ))}

                            <Pressable style={styles.addVideoButton} onPress={addPackageDraft}>
                              <Text style={styles.addVideoLabel}>+ Agregar paquete</Text>
                            </Pressable>

                            <PrimaryButton
                              label={isSavingPackages ? 'Guardando paquetes...' : 'Guardar paquetes'}
                              compact
                              onPress={() => {
                                void savePackages();
                              }}
                            />
                          </View>
                        )}
                      </View>

                      <View style={styles.subBlock}>
                        <Text style={styles.subBlockTitle}>Videos de YouTube</Text>
                        {isLoadingVideos ? (
                          <View style={styles.loadingRow}>
                            <ActivityIndicator color={colors.primary} />
                            <Text style={styles.loadingText}>Cargando videos...</Text>
                          </View>
                        ) : (
                          <View style={styles.videoEditorList}>
                            <View style={styles.videoQuickAddCard}>
                              <Text style={styles.videoEditorTitle}>Subida rapida</Text>
                              <Text style={styles.helperMuted}>Pega el link de YouTube, revisa vista previa y agrega.</Text>

                              <TextInput
                                value={quickVideoUrl}
                                onChangeText={setQuickVideoUrl}
                                placeholder="https://www.youtube.com/watch?v=..."
                                placeholderTextColor={colors.textSoft}
                                style={styles.input}
                                autoCapitalize="none"
                              />

                              {quickVideoId ? (
                                <View style={styles.videoPreviewCard}>
                                  <ReliableImage
                                    uri={quickVideoPreviewUrl}
                                    fallbackUri={getLocalVideoThumbUri(quickVideoId)}
                                    style={styles.videoPreviewImage}
                                  />
                                  <View style={styles.videoPreviewBody}>
                                    <Text style={styles.videoPreviewLabel}>ID detectado: {quickVideoId}</Text>
                                    <Text style={[styles.videoPreviewStatus, quickVideoIsDuplicate ? styles.videoPreviewStatusWarn : null]}>
                                      {quickVideoIsDuplicate ? 'Este video ya existe en tu lista.' : 'Link valido de YouTube.'}
                                    </Text>
                                  </View>
                                </View>
                              ) : quickVideoUrl.trim().length > 0 ? (
                                <Text style={styles.videoInvalidHint}>No se detecta un link valido de YouTube.</Text>
                              ) : null}

                              <TextInput
                                value={quickVideoTitle}
                                onChangeText={setQuickVideoTitle}
                                placeholder="Titulo (opcional)"
                                placeholderTextColor={colors.textSoft}
                                style={styles.input}
                              />
                              <TextInput
                                value={quickVideoSubtitle}
                                onChangeText={setQuickVideoSubtitle}
                                placeholder="Subtitulo (opcional)"
                                placeholderTextColor={colors.textSoft}
                                style={styles.input}
                              />

                              <Pressable style={styles.videoQuickAddButton} onPress={addQuickVideoDraft}>
                                <Text style={styles.videoQuickAddLabel}>Agregar video desde link</Text>
                              </Pressable>
                            </View>

                            {videoDraft.map((item, index) => (
                              <View key={item.id} style={styles.videoEditorCard}>
                                <View style={styles.videoEditorHeader}>
                                  <Text style={styles.videoEditorTitle}>Video {index + 1}</Text>
                                  <Pressable onPress={() => removeVideoDraft(item.id)}>
                                    <Text style={styles.removeVideo}>Eliminar</Text>
                                  </Pressable>
                                </View>

                                <TextInput
                                  value={item.title}
                                  onChangeText={(value) => updateDraftVideo(item.id, 'title', value)}
                                  placeholder="Titulo del video"
                                  placeholderTextColor={colors.textSoft}
                                  style={styles.input}
                                />
                                <TextInput
                                  value={item.subtitle}
                                  onChangeText={(value) => updateDraftVideo(item.id, 'subtitle', value)}
                                  placeholder="Subtitulo opcional"
                                  placeholderTextColor={colors.textSoft}
                                  style={styles.input}
                                />
                                <TextInput
                                  value={item.youtubeUrl}
                                  onChangeText={(value) => updateDraftVideo(item.id, 'youtubeUrl', value)}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  placeholderTextColor={colors.textSoft}
                                  style={styles.input}
                                  autoCapitalize="none"
                                />
                              </View>
                            ))}

                            <Pressable style={styles.addVideoButton} onPress={addVideoDraft}>
                              <Text style={styles.addVideoLabel}>+ Agregar video</Text>
                            </Pressable>

                            <PrimaryButton
                              label={isSavingVideos ? 'Guardando videos...' : 'Guardar videos'}
                              compact
                              onPress={() => {
                                void saveVideos();
                              }}
                            />
                          </View>
                        )}
                      </View>
                    </>
                  ) : null}
                </>
              ) : (
                <Text style={styles.warning}>
                  Esta cuenta no tiene permisos de panel griller. Inicia sesion con un usuario rol Griller o Admin.
                </Text>
              )}

              {panelNotice ? <Text style={styles.notice}>{panelNotice}</Text> : null}
            </View>
          </ScrollView>
        </View>

        <BottomNav activeTab="Account" onNavigate={(route) => navigation.navigate(route)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 104
  },
  scrollContent: {
    paddingTop: 12,
    gap: 18,
    paddingBottom: 18
  },
  profileCard: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.backgroundMuted
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 58,
    backgroundColor: '#FFE5E2'
  },
  profileBody: {
    flex: 1,
    gap: 2
  },
  profileName: {
    color: colors.textStrong,
    fontSize: 17,
    fontWeight: '900'
  },
  profileEmail: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  roleBadge: {
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.primarySoft
  },
  roleBadgeText: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 12
  },
  block: {
    gap: 10
  },
  blockTitle: {
    color: colors.textStrong,
    fontSize: 20,
    fontWeight: '900'
  },
  subBlock: {
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    padding: 10
  },
  subBlockTitle: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '900'
  },
  mediaTemplateCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 10
  },
  coverPreview: {
    height: 118,
    borderRadius: 12,
    overflow: 'hidden'
  },
  coverPreviewImage: {
    borderRadius: 12
  },
  coverPreviewShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 8, 0.2)'
  },
  avatarPreviewWrap: {
    marginTop: -34,
    paddingLeft: 8
  },
  avatarPreview: {
    width: 68,
    height: 68,
    borderRadius: 68,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFE5E2'
  },
  mediaActionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  quickActionButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD4CC',
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  quickActionLabel: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800'
  },
  galleryQuickBlock: {
    gap: 8
  },
  galleryQuickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  galleryAddButton: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  galleryAddLabel: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800'
  },
  galleryQuickRow: {
    gap: 8,
    paddingRight: 8
  },
  galleryQuickCard: {
    width: 108,
    height: 78,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border
  },
  galleryQuickImage: {
    width: '100%',
    height: '100%'
  },
  galleryRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 10, 8, 0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  galleryEmptyCard: {
    minHeight: 68,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  galleryEmptyText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600'
  },
  field: {
    minHeight: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center',
    gap: 2
  },
  fieldLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700'
  },
  fieldValue: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '700'
  },
  panelHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600'
  },
  chefsRow: {
    gap: 8,
    paddingRight: 12
  },
  chefChip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  chefChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  chefChipLabel: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12
  },
  chefChipLabelActive: {
    color: colors.primaryDark
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    color: colors.textStrong,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '600'
  },
  textArea: {
    minHeight: 74,
    paddingTop: 10,
    textAlignVertical: 'top'
  },
  textAreaLarge: {
    minHeight: 104,
    paddingTop: 10,
    textAlignVertical: 'top'
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  helperMuted: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '600'
  },
  daysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  quickTimesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  quickTime: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  quickTimeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  loadingRow: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12
  },
  videoEditorList: {
    gap: 8
  },
  videoQuickAddCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD4CC',
    backgroundColor: '#FFF8F7',
    padding: 10,
    gap: 8
  },
  videoPreviewCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  videoPreviewImage: {
    width: '100%',
    height: 112
  },
  videoPreviewBody: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2
  },
  videoPreviewLabel: {
    color: colors.textStrong,
    fontSize: 12,
    fontWeight: '700'
  },
  videoPreviewStatus: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700'
  },
  videoPreviewStatusWarn: {
    color: '#B45309'
  },
  videoInvalidHint: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700'
  },
  videoQuickAddButton: {
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoQuickAddLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13
  },
  videoEditorCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 8
  },
  videoEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  videoEditorTitle: {
    color: colors.textStrong,
    fontSize: 13,
    fontWeight: '800'
  },
  removeVideo: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800'
  },
  addVideoButton: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  addVideoLabel: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 13
  },
  warning: {
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16
  },
  notice: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  }
});
