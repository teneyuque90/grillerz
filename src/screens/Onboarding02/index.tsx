import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OnboardingBase } from '../../components/onboarding/OnboardingBase';
import { OnboardingArt } from '../../components/onboarding/OnboardingArt';
import { RootStackParamList } from '../../navigation/screenConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding02'>;

export function Onboarding02({ navigation }: Props) {
  return (
    <OnboardingBase
      step={2}
      title="Reserva en minutos"
      subtitle="Elige fecha, hora y paquete ideal para tu evento. Todo en una sola pantalla."
      illustration={<OnboardingArt variant={2} />}
      onNext={() => navigation.navigate('Onboarding03')}
      onSkip={() => navigation.navigate('SignIn')}
    />
  );
}
