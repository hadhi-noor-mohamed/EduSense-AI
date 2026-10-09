// ---------------------------------------------------------------------------
// EduSense AI — localisation layer
//
// English is fully implemented. Tamil is wired end-to-end so translators only
// need to fill in missing keys — no component has to be rewritten.
// ---------------------------------------------------------------------------

export type Locale = 'en' | 'ta'

type Dict = Record<string, string>

const en: Dict = {
  'nav.settings': 'Settings',
  'nav.notifications': 'Notifications',
  'settings.title': 'Settings',
  'settings.subtitle': 'Manage appearance, alerts, language, privacy and your account.',
  'settings.appearance': 'Appearance',
  'settings.theme': 'Theme',
  'settings.themeDesc': 'Choose how EduSense AI looks on this device.',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
  'settings.language': 'Language',
  'settings.languageDesc': 'Interface language for this browser session.',
  'settings.english': 'English',
  'settings.tamil': 'தமிழ்',
  'settings.notifications': 'Notifications',
  'settings.notificationsDesc': 'Choose which updates you want to receive.',
  'settings.email': 'Email notifications',
  'settings.emailDesc': 'Weekly summary of performance and risk changes.',
  'settings.risk': 'Risk alerts',
  'settings.riskDesc': 'Notify me when my risk level changes.',
  'settings.assessment': 'Assessment reminders',
  'settings.assessmentDesc': 'Reminders before quizzes and assignments are due.',
  'settings.recommendation': 'Recommendation updates',
  'settings.recommendationDesc': 'When new actions are added to my plan.',
  'settings.privacy': 'Privacy',
  'settings.privacyDesc': 'Control how your data is shared inside the platform.',
  'settings.share': 'Share anonymised analytics',
  'settings.shareDesc': 'Contribute to aggregate, non-identifying institution metrics.',
  'settings.teacherView': 'Show risk score to my teachers',
  'settings.teacherViewDesc': 'Faculty advising you can see your risk band.',
  'settings.logging': 'Learning activity logging',
  'settings.loggingDesc': 'Record self-study hours used by the prediction inputs.',
  'settings.account': 'Account',
  'settings.accountDesc': 'Password and session controls.',
  'settings.changePassword': 'Change password',
  'settings.logout': 'Log out',
  'settings.saved': 'Settings saved',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.close': 'Close',
}

const ta: Dict = {
  'nav.settings': 'அமைப்புகள்',
  'nav.notifications': 'அறிவிப்புகள்',
  'settings.title': 'அமைப்புகள்',
  'settings.subtitle': 'தோற்றம், அறிவிப்புகள், மொழி, தனியுரிமை மற்றும் கணக்கை நிர்வகிக்கவும்.',
  'settings.appearance': 'தோற்றம்',
  'settings.theme': 'கருப்பொளி / இருண்ட பின்னணி',
  'settings.themeDesc': 'EduSense AI இந்த சாதனத்தில் எப்படி தெரிய வேண்டும் என்பதைத் தேர்ந்தெடுக்கவும்.',
  'settings.light': 'இளம்',
  'settings.dark': 'இருண்டது',
  'settings.language': 'மொழி',
  'settings.languageDesc': 'இந்த உலாவி அமர்வுக்கான மொழி.',
  'settings.english': 'English',
  'settings.tamil': 'தமிழ்',
  'settings.notifications': 'அறிவிப்புகள்',
  'settings.notificationsDesc': 'எந்த புதுப்பிப்புகளைப் பெற விரும்புகிறீர்கள்.',
  'settings.email': 'மின்னஞ்சல் அறிவிப்புகள்',
  'settings.emailDesc': 'செயல்திறன் மற்றும் இடர் மாற்றங்களின் வாராந்திர சுருக்கம்.',
  'settings.risk': 'இடர் எச்சரிக்கை',
  'settings.riskDesc': 'என் இடர் நிலை மாறினால் அறிவிக்கவும்.',
  'settings.assessment': 'மதிப்பீட்டு நினைவூட்டல்',
  'settings.assessmentDesc': 'வினாடி வினா மற்றும் பணிகளுக்கு முன் நினைவூட்டல்.',
  'settings.recommendation': 'பரிந்துரை புதுப்பிப்புகள்',
  'settings.recommendationDesc': 'புதிய செயல்கள் சேர்க்கப்படும்போது.',
  'settings.privacy': 'தனியுரிமை',
  'settings.privacyDesc': 'உங்கள் தரவு எப்படி பகிரப்படுகிறது என்பதைக் கட்டுப்படுத்தவும்.',
  'settings.share': 'அநாமதேய பகுப்பாய்வைப் பகிரவும்',
  'settings.shareDesc': 'மொத்த, அடையாளமில்லா நிறுவன அளவீடுகளுக்கு பங்களிக்கவும்.',
  'settings.teacherView': 'என் இடர் மதிப்பெண்ணை ஆசிரியர்களுக்குக் காட்டவும்',
  'settings.teacherViewDesc': 'வழிகாட்டும் பேராசிரியர்கள் உங்கள் இடர் நிலையைப் பார்க்கலாம்.',
  'settings.logging': 'கற்றல் செயல்பாட்டு பதிவு',
  'settings.loggingDesc': 'இடர் கணிப்புக்கு பயன்படும் தனிப்பட்ட படிப்பு நேரத்தை பதிவுசெய்யவும்.',
  'settings.account': 'கணக்கு',
  'settings.accountDesc': 'கடவுச்சொல் மற்றும் அமர்வு கட்டுப்பாடுகள்.',
  'settings.changePassword': 'கடவுச்சொல்லை மாற்று',
  'settings.logout': 'வெளியேறு',
  'settings.saved': 'அமைப்புகள் சேமிக்கப்பட்டன',
  'common.save': 'சேமி',
  'common.cancel': 'ரத்து',
  'common.close': 'மூடு',
}

const DICTS: Record<Locale, Dict> = { en, ta }

/** Resolve a key for the active locale, falling back to English. */
export function translate(locale: Locale, key: string): string {
  return DICTS[locale][key] ?? en[key] ?? key
}

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  ta: 'தமிழ்',
}
