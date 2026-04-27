INSERT INTO department_positions (sub_department_id, name, description, deleted)
SELECT
    sd.id,
    p.position_name,
    p.position_description,
    0
FROM sub_departments sd
         JOIN department d ON d.id = sd.department_id
         JOIN (
    VALUES
-- İnsan Kaynakları
(N'İnsan Kaynakları', N'İşe Alım', N'İşe Alım Uzmanı', N'Aday bulma ve işe alım süreçlerini yürütür'),
(N'İnsan Kaynakları', N'İşe Alım', N'Yetenek Kazanımı Uzmanı', N'Yetenek kazanımı süreçlerini yürütür'),
(N'İnsan Kaynakları', N'İşe Alım', N'İşe Alım Koordinatörü', N'İşe alım organizasyon süreçlerini koordine eder'),

(N'İnsan Kaynakları', N'Bordro ve Özlük İşleri', N'Bordro Uzmanı', N'Bordro hesaplama ve takip yapar'),
(N'İnsan Kaynakları', N'Bordro ve Özlük İşleri', N'Özlük İşleri Uzmanı', N'Özlük süreçlerini yönetir'),
(N'İnsan Kaynakları', N'Bordro ve Özlük İşleri', N'Ücret ve Yan Haklar Uzmanı', N'Ücret ve yan hak süreçlerini yürütür'),

(N'İnsan Kaynakları', N'Eğitim ve Gelişim', N'Eğitim Uzmanı', N'Eğitim planlama süreçlerini yürütür'),
(N'İnsan Kaynakları', N'Eğitim ve Gelişim', N'Öğrenme ve Gelişim Uzmanı', N'Gelişim programlarını yönetir'),
(N'İnsan Kaynakları', N'Eğitim ve Gelişim', N'Kariyer Gelişim Uzmanı', N'Kariyer gelişim süreçlerini destekler'),

(N'İnsan Kaynakları', N'Çalışan İlişkileri', N'Çalışan İlişkileri Uzmanı', N'Çalışan ilişkileri süreçlerini yürütür'),
(N'İnsan Kaynakları', N'Çalışan İlişkileri', N'İK İş Ortağı', N'Departmanlarla İK süreçlerini koordine eder'),

-- Finans
(N'Finans', N'Bütçe ve Planlama', N'Bütçe Uzmanı', N'Bütçe hazırlama ve takip süreçlerini yürütür'),
(N'Finans', N'Bütçe ve Planlama', N'Finansal Planlama Uzmanı', N'Finansal planlama yapar'),

(N'Finans', N'Mali Analiz', N'Finansal Analist', N'Finansal analiz ve raporlama yapar'),
(N'Finans', N'Mali Analiz', N'Kıdemli Finansal Analist', N'İleri seviye mali analiz ve raporlama yapar'),

(N'Finans', N'Hazine Yönetimi', N'Hazine Uzmanı', N'Hazine ve nakit süreçlerini yönetir'),
(N'Finans', N'Hazine Yönetimi', N'Nakit Yönetimi Uzmanı', N'Nakit akışını takip eder'),

(N'Finans', N'Vergi Yönetimi', N'Vergi Uzmanı', N'Vergi süreçlerini takip eder'),
(N'Finans', N'Vergi Yönetimi', N'Vergi Uyum Uzmanı', N'Vergi uyum süreçlerini yönetir'),

-- Muhasebe
(N'Muhasebe', N'Genel Muhasebe', N'Genel Muhasebe Uzmanı', N'Genel muhasebe kayıtlarını yönetir'),
(N'Muhasebe', N'Genel Muhasebe', N'Kıdemli Muhasebeci', N'Muhasebe işlemlerini ve raporlamayı yürütür'),

(N'Muhasebe', N'Alacak Yönetimi', N'Alacak Takip Uzmanı', N'Alacak hesaplarını takip eder'),
(N'Muhasebe', N'Alacak Yönetimi', N'Tahsilat Koordinatörü', N'Tahsilat süreçlerini koordine eder'),

(N'Muhasebe', N'Borç Yönetimi', N'Borç Takip Uzmanı', N'Borç hesaplarını takip eder'),
(N'Muhasebe', N'Borç Yönetimi', N'Ödeme Koordinatörü', N'Ödeme süreçlerini koordine eder'),

(N'Muhasebe', N'Maliyet Muhasebesi', N'Maliyet Muhasebecisi', N'Maliyet muhasebesi işlemlerini yürütür'),
(N'Muhasebe', N'Maliyet Muhasebesi', N'Maliyet Kontrol Uzmanı', N'Maliyet kontrol süreçlerini yürütür'),

-- Satış
(N'Satış', N'Bireysel Satış', N'Satış Temsilcisi', N'Bireysel satış süreçlerini yürütür'),
(N'Satış', N'Bireysel Satış', N'Perakende Satış Uzmanı', N'Perakende satış süreçlerini yürütür'),

(N'Satış', N'Kurumsal Satış', N'Kurumsal Satış Uzmanı', N'Kurumsal satış süreçlerini yürütür'),
(N'Satış', N'Kurumsal Satış', N'Kilit Müşteri Yöneticisi', N'Önemli müşteri hesaplarını yönetir'),

(N'Satış', N'Satış Operasyon', N'Satış Operasyon Uzmanı', N'Satış operasyon süreçlerini destekler'),
(N'Satış', N'Satış Operasyon', N'CRM Uzmanı', N'Müşteri ilişkileri yönetim süreçlerini destekler'),

(N'Satış', N'Bölge Satış Yönetimi', N'Bölge Satış Müdürü', N'Bölgesel satış yönetimini yapar'),
(N'Satış', N'Bölge Satış Yönetimi', N'Bölge Satış Sorumlusu', N'Bölgesel satış ekibini koordine eder'),

-- Pazarlama
(N'Pazarlama', N'Dijital Pazarlama', N'Dijital Pazarlama Uzmanı', N'Dijital pazarlama kampanyalarını yürütür'),
(N'Pazarlama', N'Dijital Pazarlama', N'Performans Pazarlama Uzmanı', N'Performans pazarlama süreçlerini yönetir'),
(N'Pazarlama', N'Dijital Pazarlama', N'SEO Uzmanı', N'Arama motoru optimizasyonu yapar'),

(N'Pazarlama', N'İçerik Yönetimi', N'İçerik Uzmanı', N'İçerik süreçlerini yönetir'),
(N'Pazarlama', N'İçerik Yönetimi', N'Metin Yazarı', N'Metin ve kampanya içerikleri üretir'),

(N'Pazarlama', N'Marka Yönetimi', N'Marka Müdürü', N'Marka yönetimini yürütür'),
(N'Pazarlama', N'Marka Yönetimi', N'Marka Uzmanı', N'Marka stratejilerini destekler'),

(N'Pazarlama', N'Sosyal Medya', N'Sosyal Medya Uzmanı', N'Sosyal medya süreçlerini yönetir'),
(N'Pazarlama', N'Sosyal Medya', N'Topluluk Yöneticisi', N'Topluluk ve etkileşim süreçlerini yönetir'),

-- IT
(N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Backend Geliştirici', N'Sunucu tarafı uygulama geliştirir'),
(N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Frontend Geliştirici', N'Kullanıcı arayüzü geliştirir'),
(N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Full Stack Geliştirici', N'Uçtan uca uygulama geliştirir'),
(N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Mobil Geliştirici', N'Mobil uygulama geliştirir'),
(N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Uygulama Geliştirici', N'Kurumsal uygulama geliştirir'),
(N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Yazılım Mimarı', N'Yazılım mimarisini tasarlar'),

(N'Bilgi Teknolojileri', N'Sistem ve Network', N'Sistem Yöneticisi', N'Sunucu ve sistem yönetimi yapar'),
(N'Bilgi Teknolojileri', N'Sistem ve Network', N'Ağ Uzmanı', N'Ağ altyapısını yönetir'),
(N'Bilgi Teknolojileri', N'Sistem ve Network', N'Altyapı Mühendisi', N'Altyapı yönetim süreçlerini yürütür')

) AS p(department_name, sub_department_name, position_name, position_description)
              ON LTRIM(RTRIM(d.name)) = LTRIM(RTRIM(p.department_name))
                  AND LTRIM(RTRIM(sd.name)) = LTRIM(RTRIM(p.sub_department_name))
WHERE NOT EXISTS (
    SELECT 1
    FROM department_positions dp
    WHERE dp.sub_department_id = sd.id
      AND LTRIM(RTRIM(dp.name)) = LTRIM(RTRIM(p.position_name))
);