INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'İşe Alım', N'İşe alım ve aday süreçleri'),
        (N'Bordro ve Özlük İşleri', N'Bordro ve özlük süreçleri'),
        (N'Eğitim ve Gelişim', N'Çalışan eğitim ve gelişim süreçleri'),
        (N'Çalışan İlişkileri', N'Çalışan memnuniyeti ve ilişkileri')
) v(name, description)
WHERE d.name = N'İnsan Kaynakları'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Bütçe ve Planlama', N'Bütçe planlama süreçleri'),
        (N'Mali Analiz', N'Finansal analiz süreçleri'),
        (N'Hazine Yönetimi', N'Nakit ve finansal kaynak yönetimi'),
        (N'Vergi Yönetimi', N'Vergi süreçleri')
) v(name, description)
WHERE d.name = N'Finans'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Genel Muhasebe', N'Genel muhasebe işlemleri'),
        (N'Alacak Yönetimi', N'Alacak hesap süreçleri'),
        (N'Borç Yönetimi', N'Borç hesap süreçleri'),
        (N'Maliyet Muhasebesi', N'Maliyet hesaplama ve raporlama')
) v(name, description)
WHERE d.name = N'Muhasebe'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Bireysel Satış', N'Bireysel müşteri satış süreçleri'),
        (N'Kurumsal Satış', N'Kurumsal müşteri satış süreçleri'),
        (N'Satış Operasyon', N'Satış operasyon süreçleri'),
        (N'Bölge Satış Yönetimi', N'Bölgesel satış yönetimi')
) v(name, description)
WHERE d.name = N'Satış'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Dijital Pazarlama', N'Dijital kampanya süreçleri'),
        (N'İçerik Yönetimi', N'İçerik üretim ve planlama süreçleri'),
        (N'Marka Yönetimi', N'Marka stratejisi ve yönetimi'),
        (N'Sosyal Medya', N'Sosyal medya yönetimi')
) v(name, description)
WHERE d.name = N'Pazarlama'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Yazılım Geliştirme', N'Yazılım geliştirme süreçleri'),
        (N'Sistem ve Network', N'Sistem ve ağ yönetimi'),
        (N'Siber Güvenlik', N'Bilgi güvenliği süreçleri'),
        (N'IT Destek', N'Teknik destek süreçleri')
) v(name, description)
WHERE d.name = N'Bilgi Teknolojileri'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Süreç Yönetimi', N'Operasyon süreç takibi'),
        (N'Saha Operasyonları', N'Saha operasyon yönetimi'),
        (N'İş Akışı Yönetimi', N'İş akışı koordinasyonu'),
        (N'Operasyon Planlama', N'Operasyon planlama süreçleri')
) v(name, description)
WHERE d.name = N'Operasyon'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Çağrı Merkezi', N'Çağrı merkezi operasyonları'),
        (N'Teknik Destek', N'Teknik destek hizmetleri'),
        (N'Müşteri Başarı', N'Müşteri memnuniyeti ve devamlılığı'),
        (N'Şikayet Yönetimi', N'Müşteri şikayet süreçleri')
) v(name, description)
WHERE d.name = N'Müşteri Destek'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Sözleşme Yönetimi', N'Sözleşme hazırlama ve inceleme'),
        (N'Uyum ve Mevzuat', N'Yasal uyum süreçleri'),
        (N'Hukuki Danışmanlık', N'Hukuki danışmanlık hizmetleri')
) v(name, description)
WHERE d.name = N'Hukuk'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Tedarikçi Yönetimi', N'Tedarikçi ilişkileri ve takibi'),
        (N'Satın Alma Operasyonları', N'Satın alma operasyon süreçleri'),
        (N'Sözleşme ve Teklif Yönetimi', N'Teklif ve sözleşme süreçleri')
) v(name, description)
WHERE d.name = N'Satın Alma'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Depo Yönetimi', N'Depo operasyonları'),
        (N'Dağıtım Planlama', N'Dağıtım ve rota planlama'),
        (N'Stok Kontrol', N'Stok kontrol ve takip'),
        (N'Sevkiyat Operasyonları', N'Sevkiyat süreçleri')
) v(name, description)
WHERE d.name = N'Lojistik'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Ürün Geliştirme', N'Yeni ürün geliştirme süreçleri'),
        (N'Araştırma', N'Araştırma faaliyetleri'),
        (N'İnovasyon', N'Yenilikçi proje ve fikir geliştirme'),
        (N'Prototipleme', N'Prototip geliştirme süreçleri')
) v(name, description)
WHERE d.name = N'AR-GE'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Ürün Stratejisi', N'Ürün strateji yönetimi'),
        (N'İş Analizi', N'İş ihtiyaçlarını analiz etme'),
        (N'Ürün Geliştirme Koordinasyonu', N'Ürün geliştirme süreç koordinasyonu'),
        (N'Kullanıcı Deneyimi', N'UX ve kullanıcı deneyimi süreçleri')
) v(name, description)
WHERE d.name = N'Ürün Yönetimi'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Kalite Güvence', N'Kalite güvence süreçleri'),
        (N'Kalite Kontrol', N'Kalite kontrol süreçleri'),
        (N'Süreç Kalitesi', N'Süreç kalite iyileştirme')
) v(name, description)
WHERE d.name = N'Kalite Yönetimi'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);

INSERT INTO sub_departments (department_id, name, description, manager_id, deleted)
SELECT d.id, v.name, v.description, NULL, 0
FROM department d
         CROSS APPLY (
    VALUES
        (N'Kurumsal Eğitim', N'Kurumsal eğitim programları'),
        (N'Teknik Eğitim', N'Teknik yetkinlik eğitimleri'),
        (N'Kariyer Gelişimi', N'Kariyer gelişimi süreçleri')
) v(name, description)
WHERE d.name = N'Eğitim ve Gelişim'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_departments sd
    WHERE sd.department_id = d.id
      AND sd.name = v.name
);