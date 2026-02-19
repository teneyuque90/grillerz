import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { grillerzApi } from '../../api/grillerzApi';
import { AppChip } from '../../components/ui/AppChip';
import { BottomNav } from '../../components/ui/BottomNav';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { OFFLINE_DEMO_MODE } from '../../config/api';
import { getGrillerVideos } from '../../data/mediaLibrary';
import { RootStackParamList } from '../../navigation/screenConfig';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { Chef, ChefVideo } from '../../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

type VideoDraft = {
  id: string;
  title: string;
  subtitle: string;
  youtubeUrl: string;
};

type ProfileDraft = {
  name: string;
  title: string;
  city: string;
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

function toProfileDraft(chef: Chef): ProfileDraft {
  return {
    name: chef.name,
    title: chef.title,
    city: chef.city,
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

  const [videoDraft, setVideoDraft] = useState<VideoDraft[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isSavingVideos, setIsSavingVideos] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [panelNotice, setPanelNotice] = useState<string | null>(null);

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
      specialties
    };

    if (!payload.name || !payload.title || !payload.city || !payload.bio) {
      setPanelNotice('Completa nombre, titulo, ciudad y bio antes de guardar.');
      setIsSavingProfile(false);
      return;
    }

    try {
      if (OFFLINE_DEMO_MODE) {
        const nextChef = applyChefPatch(managedChef, payload);
        replaceChef(nextChef);
      } else {
        const updatedChef = await grillerzApi.updateChefProfile(managedChef.id, payload);
        replaceChef(updatedChef);
      }

      setPanelNotice('Perfil del griller actualizado.');
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
            times
          }
        });
        replaceChef(nextChef);
      } else {
        const updatedChef = await grillerzApi.updateChefAvailability(managedChef.id, {
          weekdays: availabilityWeekdays,
          times
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
                    Admin y Griller pueden actualizar perfil, menu (especialidades), agenda y videos del perfil publico.
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
                        <Text style={styles.subBlockTitle}>Videos de YouTube</Text>
                        {isLoadingVideos ? (
                          <View style={styles.loadingRow}>
                            <ActivityIndicator color={colors.primary} />
                            <Text style={styles.loadingText}>Cargando videos...</Text>
                          </View>
                        ) : (
                          <View style={styles.videoEditorList}>
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

        <BottomNav activeTab="Settings" onNavigate={(route) => navigation.navigate(route)} />
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
