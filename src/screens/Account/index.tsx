import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { grillerzApi } from '../../api/grillerzApi';
import { BottomNav } from '../../components/ui/BottomNav';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { getGrillerVideos } from '../../data/mediaLibrary';
import { RootStackParamList } from '../../navigation/screenConfig';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { ChefVideo } from '../../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

type VideoDraft = {
  id: string;
  title: string;
  subtitle: string;
  youtubeUrl: string;
};

const VIDEO_MANAGERS = new Set(['gabriel@email.com', 'admin@grillerz.app', 'demo@grillerz.app']);

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

export function Account({ navigation }: Props) {
  const { authUser, chefs, selectedChef } = useAppState();
  const userName = authUser?.name ?? 'Usuario Grillerz';
  const userEmail = authUser?.email ?? 'guest@grillerz.app';
  const userPhone = authUser?.phone ?? '+52 867 000 0000';
  const [managedChefId, setManagedChefId] = useState(selectedChef.id);
  const [videoDraft, setVideoDraft] = useState<VideoDraft[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isSavingVideos, setIsSavingVideos] = useState(false);
  const [videosNotice, setVideosNotice] = useState<string | null>(null);

  const managedChefName = useMemo(() => {
    return chefs.find((item) => item.id === managedChefId)?.name ?? 'Griller';
  }, [chefs, managedChefId]);

  const canManageVideos = VIDEO_MANAGERS.has(userEmail.toLowerCase());

  useEffect(() => {
    let active = true;
    setIsLoadingVideos(true);
    setVideosNotice(null);

    async function loadChefVideos() {
      try {
        const remoteVideos = await grillerzApi.getChefVideos(managedChefId);
        if (active) {
          setVideoDraft(toVideoDraft(remoteVideos));
        }
      } catch {
        if (active) {
          setVideoDraft(toVideoDraft(getGrillerVideos(managedChefId)));
          setVideosNotice('Se cargaron videos locales. Para guardar cambios, conecta el backend.');
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
  }, [managedChefId]);

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
      setVideosNotice('Maximo 12 videos por griller.');
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

  async function saveVideos() {
    if (isSavingVideos) {
      return;
    }

    if (!canManageVideos) {
      setVideosNotice('Esta cuenta no tiene permisos para administrar videos de grillers.');
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
      setVideosNotice('Agrega al menos un video con titulo y link de YouTube.');
      return;
    }

    setIsSavingVideos(true);
    setVideosNotice(null);

    try {
      const savedVideos = await grillerzApi.updateChefVideos(managedChefId, {
        videos: payloadVideos
      });
      setVideoDraft(toVideoDraft(savedVideos));
      setVideosNotice(`Videos guardados para ${managedChefName}.`);
    } catch (error) {
      setVideosNotice(error instanceof Error ? error.message : 'No se pudieron guardar los videos.');
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
              <Pressable style={styles.editChip}>
                <Text style={styles.editChipLabel}>Editar</Text>
              </Pressable>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Informacion personal</Text>
              <Field label="Nombre" value={userName} />
              <Field label="Telefono" value={userPhone} />
              <Field label="Correo" value={userEmail} />
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Direccion principal</Text>
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.cardTitle}>Casa</Text>
                  <Text style={styles.cardText}>Guanajuato 254, Nuevo Laredo</Text>
                </View>
                <Text style={styles.link}>{'>'}</Text>
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Metodos de pago</Text>
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.cardTitle}>Visa terminacion 3902</Text>
                  <Text style={styles.cardText}>Default  -  Exp 10/29</Text>
                </View>
                <Text style={styles.link}>{'>'}</Text>
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Seguridad</Text>
              <View style={styles.securityRow}>
                <Text style={styles.securityLabel}>Verificacion en dos pasos</Text>
                <Text style={styles.statusOn}>ACTIVA</Text>
              </View>
              <View style={styles.securityRow}>
                <Text style={styles.securityLabel}>Biometria</Text>
                <Text style={styles.statusOn}>ACTIVA</Text>
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Panel de videos (YouTube)</Text>
              <Text style={styles.panelHint}>
                Selecciona un griller y guarda sus links. Estos videos se veran en el perfil publico.
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chefsRow}>
                {chefs.map((item) => {
                  const isActive = item.id === managedChefId;
                  return (
                    <Pressable key={item.id} style={[styles.chefChip, isActive ? styles.chefChipActive : null]} onPress={() => setManagedChefId(item.id)}>
                      <Text style={[styles.chefChipLabel, isActive ? styles.chefChipLabelActive : null]}>{item.name}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {isLoadingVideos ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={styles.loadingText}>Cargando videos de {managedChefName}...</Text>
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
                </View>
              )}

              {!canManageVideos ? (
                <Text style={styles.warning}>
                  Cuenta sin permisos de panel. Usa `gabriel@email.com` / `123456` para editar videos.
                </Text>
              ) : null}

              {videosNotice ? <Text style={styles.notice}>{videosNotice}</Text> : null}
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label={isSavingVideos ? 'Guardando videos...' : 'Guardar videos del panel'}
            onPress={() => {
              void saveVideos();
            }}
          />
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
    paddingBottom: 190
  },
  scrollContent: {
    paddingTop: 12,
    gap: 16,
    paddingBottom: 14
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
  editChip: {
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.primarySoft
  },
  editChipLabel: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 12
  },
  block: {
    gap: 10
  },
  blockTitle: {
    color: colors.textStrong,
    fontSize: 19,
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
  cardRow: {
    minHeight: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  cardTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '800'
  },
  cardText: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  link: {
    color: colors.textSoft,
    fontWeight: '900'
  },
  securityRow: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  securityLabel: {
    color: colors.text,
    fontWeight: '700'
  },
  statusOn: {
    color: '#067647',
    fontWeight: '800',
    fontSize: 12
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
  loadingRow: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.backgroundMuted
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
    backgroundColor: colors.backgroundMuted,
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
  input: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    color: colors.textStrong,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '600'
  },
  addVideoButton: {
    minHeight: 46,
    borderRadius: 12,
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
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 100
  }
});
