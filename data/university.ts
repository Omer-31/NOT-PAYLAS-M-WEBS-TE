/**
 * Basit fakülte-bölüm veri kaynağı. İhtiyaca göre genişletilebilir.
 */

export type Department = {
  name: string;
};

export type Faculty = {
  name: string;
  departments: Department[];
};

export const FACULTIES: Faculty[] = [
  // Kaynak: ERÜ Fakülteler listesi
  { name: 'Diş Hekimliği Fakültesi', departments: [{ name: 'Diş Hekimliği' }, { name: 'Diğer' }] },
  { name: 'Eczacılık Fakültesi', departments: [{ name: 'Eczacılık' }, { name: 'Diğer' }] },
  { name: 'Edebiyat Fakültesi', departments: [
    { name: 'Türk Dili ve Edebiyatı' }, { name: 'İngiliz Dili ve Edebiyatı' }, { name: 'Tarih' }, { name: 'Sosyoloji' }, { name: 'Felsefe' }, { name: 'Psikoloji' }, { name: 'Diğer' }
  ] },
  { name: 'Eğitim Fakültesi', departments: [
    { name: 'Bilgisayar ve Öğretim Teknolojileri Eğitimi' }, { name: 'Matematik Eğitimi' }, { name: 'Fen Bilgisi Eğitimi' }, { name: 'Türkçe Eğitimi' }, { name: 'Sosyal Bilgiler Eğitimi' }, { name: 'Diğer' }
  ] },
  { name: 'Fen Fakültesi', departments: [{ name: 'Matematik' }, { name: 'Fizik' }, { name: 'Kimya' }, { name: 'Biyoloji' }, { name: 'Moleküler Biyoloji ve Genetik' }, { name: 'Diğer' }] },
  { name: 'Güzel Sanatlar Fakültesi', departments: [{ name: 'Resim' }, { name: 'Heykel' }, { name: 'Müzik' }, { name: 'Seramik' }, { name: 'Diğer' }] },
  { name: 'Havacılık Ve Uzay Bilimleri Fakültesi', departments: [{ name: 'Uçak Mühendisliği' }, { name: 'Uzay Mühendisliği' }, { name: 'Pilotaj' }, { name: 'Diğer' }] },
  { name: 'Hukuk Fakültesi', departments: [{ name: 'Hukuk' }, { name: 'Diğer' }] },
  { name: 'İktisadi Ve İdari Bilimler Fakültesi', departments: [{ name: 'İşletme' }, { name: 'İktisat' }, { name: 'Kamu Yönetimi' }, { name: 'Uluslararası İlişkiler' }, { name: 'Maliye' }, { name: 'Diğer' }] },
  { name: 'İlahiyat Fakültesi', departments: [{ name: 'İlahiyat' }, { name: 'Diğer' }] },
  { name: 'İletişim Fakültesi', departments: [{ name: 'Gazetecilik' }, { name: 'Halkla İlişkiler ve Tanıtım' }, { name: 'Radyo Televizyon ve Sinema' }, { name: 'Diğer' }] },
  { name: 'Mimarlık Fakültesi', departments: [{ name: 'Mimarlık' }, { name: 'Şehir ve Bölge Planlama' }, { name: 'İç Mimarlık' }, { name: 'Diğer' }] },
  { name: 'Mühendislik Fakültesi', departments: [
    { name: 'Bilgisayar Mühendisliği' }, { name: 'Elektrik-Elektronik Mühendisliği' }, { name: 'Makine Mühendisliği' }, { name: 'İnşaat Mühendisliği' }, { name: 'Endüstri Mühendisliği' }, { name: 'Çevre Mühendisliği' }, { name: 'Mekatronik Mühendisliği' }, { name: 'Kimya Mühendisliği' }, { name: 'Biyomedikal Mühendisliği' }, { name: 'Diğer' }
  ] },
  { name: 'Sağlık Bilimleri Fakültesi', departments: [{ name: 'Hemşirelik' }, { name: 'Fizyoterapi ve Rehabilitasyon' }, { name: 'Beslenme ve Diyetetik' }, { name: 'Sağlık Yönetimi' }, { name: 'Diğer' }] },
  { name: 'Spor Bilimleri Fakültesi', departments: [{ name: 'Beden Eğitimi ve Spor Öğretmenliği' }, { name: 'Antrenörlük' }, { name: 'Spor Yöneticiliği' }, { name: 'Rekreasyon' }, { name: 'Diğer' }] },
  { name: 'Tıp Fakültesi', departments: [{ name: 'Tıp' }, { name: 'Diğer' }] },
  { name: 'Turizm Fakültesi', departments: [{ name: 'Turizm İşletmeciliği' }, { name: 'Gastronomi ve Mutfak Sanatları' }, { name: 'Diğer' }] },
  { name: 'Veteriner Fakültesi', departments: [{ name: 'Veterinerlik' }, { name: 'Diğer' }] },
  { name: 'Ziraat Fakültesi', departments: [{ name: 'Tarla Bitkileri' }, { name: 'Bahçe Bitkileri' }, { name: 'Toprak Bilimi ve Bitki Besleme' }, { name: 'Zootekni' }, { name: 'Tarım Ekonomisi' }, { name: 'Diğer' }] }
];

export const CLASS_YEARS = [
  'Hazırlık',
  '1. Sınıf',
  '2. Sınıf',
  '3. Sınıf',
  '4. Sınıf',
  '5. Sınıf',
  '6. Sınıf'
];


