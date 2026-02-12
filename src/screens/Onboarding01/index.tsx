import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OnboardingBase } from '../../components/onboarding/OnboardingBase';
import { OnboardingArt } from '../../components/onboarding/OnboardingArt';
import { RootStackParamList } from '../../navigation/screenConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding01'>;

export function Onboarding01({ navigation }: Props) {
  return (
    <OnboardingBase
      step={1}
      title="Los mejores grillers, en tu zona"
      subtitle="Descubre perfiles verificados, especialidades y reseñas reales antes de contratar."
      illustration={<OnboardingArt variant={1} />}
      onNext={() => navigation.navigate('Onboarding02')}
      onSkip={() => navigation.navigate('SignIn')}
    />
  );
}
