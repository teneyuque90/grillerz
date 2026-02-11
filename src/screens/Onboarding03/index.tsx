import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OnboardingBase } from '../../components/onboarding/OnboardingBase';
import { OnboardingArt } from '../../components/onboarding/OnboardingArt';
import { RootStackParamList } from '../../navigation/screenConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding03'>;

export function Onboarding03({ navigation }: Props) {
  return (
    <OnboardingBase
      step={3}
      title="Activa ubicacion y comienza"
      subtitle="Te mostraremos chefs cercanos disponibles hoy para que reserves sin friccion."
      illustration={<OnboardingArt variant={3} />}
      onNext={() => navigation.navigate('SignIn')}
      onSkip={() => navigation.navigate('SignIn')}
      nextLabel="Empezar"
    />
  );
}
