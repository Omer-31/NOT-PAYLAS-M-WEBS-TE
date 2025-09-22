/**
 * Basit müfredat veri kaynağı: Fakülte > Bölüm > Sınıf -> Ders isimleri
 * Gerektikçe genişletilebilir veya backend'den beslenebilir.
 */

export type CurriculumMap = {
  [faculty: string]: {
    [department: string]: {
      [classYear: string]: string[];
    };
  };
};

export const CURRICULUM: CurriculumMap = {
  'İlahiyat Fakültesi': {
    'İlahiyat': {
      '1. Sınıf': [
        'Arap Dili ve Edebiyatı I',
        "Kur'an Okuma ve Tecvid I",
        'Siyer',
        'İslam İnanç Esasları',
        'Türk Dili I',
        'Yabancı Dil I',
        'Atatürk İlkeleri ve İnkılap Tarihi I',
        'İslam Hukukuna Giriş',
        'Tefsir Usulü',
      ],
      '2. Sınıf': [
        'Arap Dili ve Edebiyatı II',
        "Kur'an Okuma ve Tecvid II",
        'İslam Tarihi I',
        'Türk Dili II',
        'Yabancı Dil II',
        'Atatürk İlkeleri ve İnkılap Tarihi II',
        'İslam İbadet Esasları',
        'Osmanlı Türkçesi',
        'Eğitime Giriş',
        'Eğitim Psikolojisi',
        "Kur'an'da Ana Konular",
      ],
      '3. Sınıf': [
        "Kur'an Okuma ve Tecvid III",
        'İslam Tarihi II',
        'Din Psikolojisi I',
        'Din Sosyolojisi I',
        'Mantık',
        'Türk Din Musikisi (Nazariyat)',
        'İslam Ahlak Esasları ve Felsefesi',
        'İslam Hukuku Usulü I',
        'Hadis I',
      ],
      '4. Sınıf': [
        'Tefsir Tarihi',
        'Hadis Usulü',
        'Kelam',
        'Mezhepler Tarihi',
        'Din Eğitimi ve Öğretimi',
        'Seçmeli Alan Dersleri'
      ]
    },
    'Diğer': {
      '2. Sınıf': ['Temel Alan Dersi 1', 'Temel Alan Dersi 2']
    }
  },
  'Mühendislik Fakültesi': {
    'Bilgisayar Mühendisliği': {
      '1. Sınıf': [
        'Matematik I',
        'Fizik I',
        'Türk Dili I',
        'Atatürk İlkeleri ve İnkılap Tarihi I',
        'Introduction to Computer Engineering',
        'Lineer Cebir',
        'Bilgisayar Programlama I',
        'English for Computer Engineering I',
        'Matematik II',
        'Fizik II',
        'Türk Dili II',
        'Atatürk İlkeleri ve İnkılap Tarihi II',
        'Bilgisayar Programlama II',
        'Discrete Mathematics',
        'Kariyer Planlama',
        'English for Computer Engineering II'
      ],
      '2. Sınıf': [
        'Electrical Circuits',
        'Veri Yapıları ve Algoritmalar',
        'Mühendislik Matematiği',
        'Object Oriented Programming',
        'Diferansiyel Denklemler',
        'Elektronik Devreler',
        'Sayısal Yöntemler',
        'Probability Theory and Statistics',
        'Lojik Devreler ve Tasarımı',
        'Electrical and Electronic Circuits Laboratory',
        'Visual Programming'
      ],
      '3. Sınıf': [
        'Sistem Programlama',
        'İşletim Sistemleri',
        'Bilgisayar Ağları',
        'Veritabanı Yönetim Sistemleri',
        'Microprocessors',
        'Digital Systems Laboratory',
        'Dosya Organizasyon Teknikleri',
        'Bilgisayar Grafik'
      ],
      '4. Sınıf': [
        'Yazılım Mühendisliği',
        'Embedded Systems',
        'Biçimsel Diller ve Otomata Teorisi',
        'Computer Architecture',
        'Design Project',
        'Bitirme Ödevi',
        'Staj I',
        'Staj II',
        'Seçmeli: Introduction to Data Mining',
        'Seçmeli: Introduction to Machine Learning',
        'Seçmeli: Derin Öğrenmeye Giriş',
        'Seçmeli: Bilgi Güvenliği',
        'Seçmeli: Mobile Application Development',
        'Seçmeli: Kablosuz Ağlara Giriş',
        'Seçmeli: Hardware Description Languages',
        'Seçmeli: Introduction to Pattern Recognition',
        'Seçmeli: Optimizasyon Algoritmaları'
      ]
    },
  },
  'Hukuk Fakültesi': {
    'Hukuk': {
      '1. Sınıf': [
        'Hukuka Giriş',
        'Roma Hukuku',
        'Anayasa Hukuku I',
        'Medeni Hukuk I',
        'Hukuk Metodolojisi',
        'Genel Ekonomi/İktisada Giriş',
        'Siyasal Bilimler'
      ],
      '2. Sınıf': [
        'Anayasa Hukuku II',
        'İdare Hukuku I',
        'Ceza Hukuku (Genel Hükümler) I',
        'Medeni Hukuk II',
        'Borçlar Hukuku (Genel Hükümler)',
        'İnsan Hakları Hukuku Giriş'
      ],
      '3. Sınıf': [
        'Ceza Hukuku (Özel Hükümler)',
        'İdare Hukuku II',
        'Ticaret Hukuku',
        'İcra ve İflas Hukuku',
        'Vergi Hukuku',
        'İş ve Sosyal Güvenlik Hukuku'
      ],
      '4. Sınıf': [
        'Medeni Usul Hukuku',
        'Milletlerarası Özel Hukuk',
        'Devletler Umumi Hukuku (Kamu MIH)',
        'İcra ve İflas Hukukunda İleri Konular',
        'Seçmeli Alan Dersleri'
      ]
    }
  }
};

export function getCoursesFor(
  faculty?: string,
  department?: string,
  classYear?: string
): string[] | null {
  if (!faculty || !department || !classYear) return null;
  const fac = CURRICULUM[faculty];
  if (!fac) return null;
  const dep = fac[department] || fac['Diğer'];
  if (!dep) return null;
  const courses = dep[classYear];
  return courses || null;
}
