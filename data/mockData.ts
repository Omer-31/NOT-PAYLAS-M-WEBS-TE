/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Comment {
    id: number;
    user: string;
    avatar: string; // A letter or an image URL
    text: string;
    timestamp: string;
}

export interface Note {
    id: number;
    title: string;
    course: string;
    uploader: string;
    rating: number;
    downloads: number;
    type: 'Vize' | 'Final' | 'Ders Notu' | 'Proje' | 'Quiz';
    fileName: string;
    fileUrl: string;
    fileType: 'pdf' | 'png' | 'jpg' | 'docx';
    description: string;
    comments: Comment[];
}

export const mockNotes: Note[] = [
  { 
    id: 1, 
    title: "Veri Yapıları - Vize Notları", 
    course: "CENG 201", 
    uploader: "Ahmet Y.", 
    rating: 4.8, 
    downloads: 1250, 
    type: 'Vize',
    fileName: "vize_notlari.pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: 'pdf',
    description: "Bu not, veri yapıları dersinin vize konularını kapsamaktadır. Linked listler, stack'ler, queue'lar ve ağaç yapıları gibi temel konular detaylı bir şekilde anlatılmıştır. Örnek kodlar ve çözümlü sorular içermektedir.",
    comments: [
        { id: 1, user: "Elif", avatar: "E", text: "Çok teşekkürler, sınavda çok yardımcı oldu!", timestamp: "2 gün önce"},
        { id: 2, user: "Murat", avatar: "M", text: "Ağaçlar konusu çok iyi anlatılmış.", timestamp: "1 gün önce"}
    ]
  },
  { 
    id: 2, 
    title: "Algoritma Analizi Final Özeti", 
    course: "CENG 302", 
    uploader: "Zeynep K.", 
    rating: 4.9, 
    downloads: 980, 
    type: 'Final',
    fileName: "algoritma_final_ozeti.png",
    fileUrl: "https://via.placeholder.com/800x1100.png?text=Algorithm+Analysis+Summary",
    fileType: 'png',
    description: "Algoritma analizi dersinin final sınavı için hazırlanmış kapsamlı bir özet. Big-O notasyonu, karmaşıklık analizi, sıralama ve arama algoritmaları gibi konuları içerir.",
    comments: [
        { id: 3, user: "Can", avatar: "C", text: "Eline sağlık, tam aradığım şeydi.", timestamp: "5 saat önce"}
    ]
  },
  { 
    id: 3, 
    title: "Ayrık Matematik Ders Notları", 
    course: "CENG 203", 
    uploader: "Mehmet A.", 
    rating: 4.5, 
    downloads: 760, 
    type: 'Ders Notu',
    fileName: "discrete_math.jpg",
    fileUrl: "https://via.placeholder.com/800x1100.jpg?text=Discrete+Math+Notes",
    fileType: 'jpg',
    description: "Dönem boyunca tutulmuş, temiz ve okunaklı ayrık matematik ders notları. Kümeler teorisi, mantık ve ispat yöntemleri gibi konuları kapsar.",
    comments: []
  },
  { 
    id: 4, 
    title: "Sayısal Devreler Lab Raporu", 
    course: "CENG 204", 
    uploader: "Ayşe T.", 
    rating: 4.7, 
    downloads: 540, 
    type: 'Proje',
    fileName: "lab_raporu_3.docx",
    fileUrl: "#",
    fileType: 'docx',
    description: "Sayısal devreler dersi için hazırlanmış 3. laboratuvar deneyi raporu. Deneyin amacı, yapılışı ve sonuçları detaylı bir şekilde açıklanmıştır.",
    comments: [
        { id: 4, user: "Buse", avatar: "B", text: "Rapor formatı için harika bir örnek, teşekkürler.", timestamp: "3 gün önce"}
    ]
  },
  { 
    id: 5, 
    title: "İşletim Sistemleri Quiz Soruları", 
    course: "CENG 305", 
    uploader: "Fatma S.", 
    rating: 4.6, 
    downloads: 1500, 
    type: 'Quiz',
    fileName: "os_quiz.pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: 'pdf',
    description: "Geçmiş yıllara ait işletim sistemleri quiz soruları ve çözümleri. Sınav öncesi pratik yapmak için ideal.",
    comments: [
        { id: 5, user: "Kerem", avatar: "K", text: "Bu soruların aynısı sınavda çıktı!", timestamp: "1 hafta önce"}
    ]
  },
  { 
    id: 6, 
    title: "Veritabanı Yönetimi Proje Dokümanı", 
    course: "CENG 306", 
    uploader: "Ali V.", 
    rating: 5.0, 
    downloads: 2100, 
    type: 'Proje',
    fileName: "db_project.pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: 'pdf',
    description: "Kütüphane otomasyonu için hazırlanmış veritabanı projesi. ER diyagramı, normalizasyon adımları ve SQL kodlarını içerir.",
    comments: [
        { id: 6, user: "Selin", avatar: "S", text: "Projem için çok ilham verici oldu, eline sağlık.", timestamp: "4 gün önce"},
        { id: 7, user: "Tolga", avatar: "T", text: "Mükemmel bir çalışma.", timestamp: "4 gün önce"}
    ]
  },
];