INSERT INTO department_positions (sub_department_id, name, description, deleted)
SELECT
    sd.id,
    p.position_name,
    p.position_description,
    0
FROM sub_departments sd
         JOIN department d
              ON d.id = sd.department_id
         JOIN (
    VALUES
        (N'İnsan Kaynakları', N'İşe Alım', N'Recruitment Specialist', N'Aday bulma ve işe alım süreçlerini yürütür'),
        (N'İnsan Kaynakları', N'İşe Alım', N'Talent Acquisition Specialist', N'Yetenek kazanımı süreçlerini yürütür'),
        (N'İnsan Kaynakları', N'İşe Alım', N'Recruitment Coordinator', N'İşe alım organizasyon süreçlerini koordine eder'),

        (N'İnsan Kaynakları', N'Bordro ve Özlük İşleri', N'Payroll Specialist', N'Bordro hesaplama ve takip yapar'),
        (N'İnsan Kaynakları', N'Bordro ve Özlük İşleri', N'Personnel Affairs Specialist', N'Özlük süreçlerini yönetir'),
        (N'İnsan Kaynakları', N'Bordro ve Özlük İşleri', N'Compensation and Benefits Specialist', N'Ücret ve yan hak süreçlerini yürütür'),

        (N'İnsan Kaynakları', N'Eğitim ve Gelişim', N'Training Specialist', N'Eğitim planlama süreçlerini yürütür'),
        (N'İnsan Kaynakları', N'Eğitim ve Gelişim', N'Learning and Development Specialist', N'Gelişim programlarını yönetir'),
        (N'İnsan Kaynakları', N'Eğitim ve Gelişim', N'Career Development Specialist', N'Kariyer gelişim süreçlerini destekler'),

        (N'İnsan Kaynakları', N'Çalışan İlişkileri', N'Employee Relations Specialist', N'Çalışan ilişkileri süreçlerini yürütür'),
        (N'İnsan Kaynakları', N'Çalışan İlişkileri', N'HR Business Partner', N'Departmanlarla İK süreçlerini koordine eder'),

        (N'Finans', N'Bütçe ve Planlama', N'Budget Specialist', N'Bütçe hazırlama ve takip süreçlerini yürütür'),
        (N'Finans', N'Bütçe ve Planlama', N'Financial Planning Specialist', N'Finansal planlama yapar'),

        (N'Finans', N'Mali Analiz', N'Financial Analyst', N'Finansal analiz ve raporlama yapar'),
        (N'Finans', N'Mali Analiz', N'Senior Financial Analyst', N'İleri seviye mali analiz ve raporlama yapar'),

        (N'Finans', N'Hazine Yönetimi', N'Treasury Specialist', N'Hazine ve nakit süreçlerini yönetir'),
        (N'Finans', N'Hazine Yönetimi', N'Cash Management Specialist', N'Nakit akışını takip eder'),

        (N'Finans', N'Vergi Yönetimi', N'Tax Specialist', N'Vergi süreçlerini takip eder'),
        (N'Finans', N'Vergi Yönetimi', N'Tax Compliance Specialist', N'Vergi uyum süreçlerini yönetir'),

        (N'Muhasebe', N'Genel Muhasebe', N'General Ledger Accountant', N'Genel muhasebe kayıtlarını yönetir'),
        (N'Muhasebe', N'Genel Muhasebe', N'Senior Accountant', N'Muhasebe işlemlerini ve raporlamayı yürütür'),

        (N'Muhasebe', N'Alacak Yönetimi', N'Accounts Receivable Specialist', N'Alacak hesaplarını takip eder'),
        (N'Muhasebe', N'Alacak Yönetimi', N'Receivables Coordinator', N'Tahsilat süreçlerini koordine eder'),

        (N'Muhasebe', N'Borç Yönetimi', N'Accounts Payable Specialist', N'Borç hesaplarını takip eder'),
        (N'Muhasebe', N'Borç Yönetimi', N'Payables Coordinator', N'Ödeme süreçlerini koordine eder'),

        (N'Muhasebe', N'Maliyet Muhasebesi', N'Cost Accountant', N'Maliyet muhasebesi işlemlerini yürütür'),
        (N'Muhasebe', N'Maliyet Muhasebesi', N'Cost Control Specialist', N'Maliyet kontrol süreçlerini yürütür'),

        (N'Satış', N'Bireysel Satış', N'Sales Representative', N'Bireysel satış süreçlerini yürütür'),
        (N'Satış', N'Bireysel Satış', N'Retail Sales Specialist', N'Perakende satış süreçlerini yürütür'),

        (N'Satış', N'Kurumsal Satış', N'Corporate Sales Specialist', N'Kurumsal satış süreçlerini yürütür'),
        (N'Satış', N'Kurumsal Satış', N'Key Account Manager', N'Önemli müşteri hesaplarını yönetir'),

        (N'Satış', N'Satış Operasyon', N'Sales Operations Specialist', N'Satış operasyon süreçlerini destekler'),
        (N'Satış', N'Satış Operasyon', N'CRM Specialist', N'Müşteri ilişkileri yönetim süreçlerini destekler'),

        (N'Satış', N'Bölge Satış Yönetimi', N'Regional Sales Manager', N'Bölgesel satış yönetimini yapar'),
        (N'Satış', N'Bölge Satış Yönetimi', N'Area Sales Supervisor', N'Bölgesel satış ekibini koordine eder'),

        (N'Pazarlama', N'Dijital Pazarlama', N'Digital Marketing Specialist', N'Dijital pazarlama kampanyalarını yürütür'),
        (N'Pazarlama', N'Dijital Pazarlama', N'Performance Marketing Specialist', N'Performans pazarlama süreçlerini yönetir'),
        (N'Pazarlama', N'Dijital Pazarlama', N'SEO Specialist', N'Arama motoru optimizasyonu yapar'),

        (N'Pazarlama', N'İçerik Yönetimi', N'Content Specialist', N'İçerik süreçlerini yönetir'),
        (N'Pazarlama', N'İçerik Yönetimi', N'Copywriter', N'Metin ve kampanya içerikleri üretir'),

        (N'Pazarlama', N'Marka Yönetimi', N'Brand Manager', N'Marka yönetimini yürütür'),
        (N'Pazarlama', N'Marka Yönetimi', N'Brand Specialist', N'Marka stratejilerini destekler'),

        (N'Pazarlama', N'Sosyal Medya', N'Social Media Specialist', N'Sosyal medya süreçlerini yönetir'),
        (N'Pazarlama', N'Sosyal Medya', N'Community Manager', N'Topluluk ve etkileşim süreçlerini yönetir'),

        (N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Backend Developer', N'Sunucu tarafı uygulama geliştirir'),
        (N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Frontend Developer', N'Kullanıcı arayüzü geliştirir'),
        (N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Full Stack Developer', N'Uçtan uca uygulama geliştirir'),
        (N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Mobile Developer', N'Mobil uygulama geliştirir'),
        (N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Application Developer', N'Kurumsal uygulama geliştirir'),
        (N'Bilgi Teknolojileri', N'Yazılım Geliştirme', N'Software Architect', N'Yazılım mimarisini tasarlar'),

        (N'Bilgi Teknolojileri', N'Sistem ve Network', N'System Administrator', N'Sunucu ve sistem yönetimi yapar'),
        (N'Bilgi Teknolojileri', N'Sistem ve Network', N'Network Specialist', N'Ağ altyapısını yönetir'),
        (N'Bilgi Teknolojileri', N'Sistem ve Network', N'Infrastructure Engineer', N'Altyapı yönetim süreçlerini yürütür'),

        (N'Bilgi Teknolojileri', N'Siber Güvenlik', N'Security Analyst', N'Güvenlik tehditlerini analiz eder'),
        (N'Bilgi Teknolojileri', N'Siber Güvenlik', N'Information Security Specialist', N'Bilgi güvenliği süreçlerini yönetir'),
        (N'Bilgi Teknolojileri', N'Siber Güvenlik', N'SOC Analyst', N'Güvenlik operasyon merkezi süreçlerini yürütür'),
        (N'Bilgi Teknolojileri', N'Siber Güvenlik', N'Penetration Tester', N'Sızma testi süreçlerini yürütür'),

        (N'Bilgi Teknolojileri', N'IT Destek', N'IT Support Specialist', N'Kullanıcılara teknik destek sağlar'),
        (N'Bilgi Teknolojileri', N'IT Destek', N'Help Desk Specialist', N'Destek taleplerini karşılar'),
        (N'Bilgi Teknolojileri', N'IT Destek', N'Technical Support Engineer', N'Teknik sorun çözüm süreçlerini yürütür'),

        (N'Operasyon', N'Süreç Yönetimi', N'Process Analyst', N'Süreç analizi ve iyileştirme yapar'),
        (N'Operasyon', N'Süreç Yönetimi', N'Operations Specialist', N'Operasyon süreçlerini yürütür'),

        (N'Operasyon', N'Saha Operasyonları', N'Field Operations Coordinator', N'Saha operasyon süreçlerini koordine eder'),
        (N'Operasyon', N'Saha Operasyonları', N'Field Supervisor', N'Saha ekiplerini yönetir'),

        (N'Operasyon', N'İş Akışı Yönetimi', N'Workflow Coordinator', N'İş akışlarını koordine eder'),
        (N'Operasyon', N'İş Akışı Yönetimi', N'Process Coordinator', N'Süreç koordinasyonunu sağlar'),

        (N'Operasyon', N'Operasyon Planlama', N'Operations Planner', N'Operasyon planlamasını yapar'),
        (N'Operasyon', N'Operasyon Planlama', N'Capacity Planning Specialist', N'Kapasite planlamasını yapar'),

        (N'Müşteri Destek', N'Çağrı Merkezi', N'Call Center Agent', N'Çağrı merkezi taleplerini karşılar'),
        (N'Müşteri Destek', N'Çağrı Merkezi', N'Call Center Team Leader', N'Çağrı merkezi ekibini yönetir'),

        (N'Müşteri Destek', N'Teknik Destek', N'Technical Support Specialist', N'Teknik destek sağlar'),
        (N'Müşteri Destek', N'Teknik Destek', N'Support Engineer', N'Teknik sorun çözüm süreçlerini yürütür'),

        (N'Müşteri Destek', N'Müşteri Başarı', N'Customer Success Specialist', N'Müşteri memnuniyeti ve devamlılığını sağlar'),
        (N'Müşteri Destek', N'Müşteri Başarı', N'Account Success Manager', N'Müşteri başarı süreçlerini yönetir'),

        (N'Müşteri Destek', N'Şikayet Yönetimi', N'Complaint Resolution Specialist', N'Şikayet çözüm süreçlerini yürütür'),
        (N'Müşteri Destek', N'Şikayet Yönetimi', N'Escalation Specialist', N'İleri seviye şikayet süreçlerini yönetir'),

        (N'Hukuk', N'Sözleşme Yönetimi', N'Contract Specialist', N'Sözleşme hazırlama ve inceleme yapar'),
        (N'Hukuk', N'Sözleşme Yönetimi', N'Contract Review Specialist', N'Sözleşme inceleme süreçlerini yürütür'),

        (N'Hukuk', N'Uyum ve Mevzuat', N'Compliance Specialist', N'Uyum ve mevzuat süreçlerini yönetir'),
        (N'Hukuk', N'Uyum ve Mevzuat', N'Regulatory Affairs Specialist', N'Yasal düzenleme süreçlerini takip eder'),

        (N'Hukuk', N'Hukuki Danışmanlık', N'Legal Counsel', N'Hukuki danışmanlık sağlar'),
        (N'Hukuk', N'Hukuki Danışmanlık', N'Corporate Lawyer', N'Kurumsal hukuk süreçlerini yönetir'),

        (N'Satın Alma', N'Tedarikçi Yönetimi', N'Supplier Relations Specialist', N'Tedarikçi ilişkilerini yönetir'),
        (N'Satın Alma', N'Tedarikçi Yönetimi', N'Vendor Manager', N'Tedarikçi performansını yönetir'),

        (N'Satın Alma', N'Satın Alma Operasyonları', N'Purchasing Specialist', N'Satın alma süreçlerini yürütür'),
        (N'Satın Alma', N'Satın Alma Operasyonları', N'Procurement Specialist', N'Tedarik süreçlerini yönetir'),

        (N'Satın Alma', N'Sözleşme ve Teklif Yönetimi', N'Sourcing Specialist', N'Kaynak ve teklif araştırması yapar'),
        (N'Satın Alma', N'Sözleşme ve Teklif Yönetimi', N'Tender Specialist', N'Teklif ve ihale süreçlerini yürütür'),

        (N'Lojistik', N'Depo Yönetimi', N'Warehouse Coordinator', N'Depo süreçlerini koordine eder'),
        (N'Lojistik', N'Depo Yönetimi', N'Warehouse Supervisor', N'Depo operasyonlarını yönetir'),

        (N'Lojistik', N'Dağıtım Planlama', N'Distribution Planner', N'Dağıtım planlamasını yapar'),
        (N'Lojistik', N'Dağıtım Planlama', N'Route Planning Specialist', N'Rota planlamasını yapar'),

        (N'Lojistik', N'Stok Kontrol', N'Inventory Controller', N'Stok kontrol süreçlerini yürütür'),
        (N'Lojistik', N'Stok Kontrol', N'Stock Control Specialist', N'Stok takip ve raporlama yapar'),

        (N'Lojistik', N'Sevkiyat Operasyonları', N'Shipment Coordinator', N'Sevkiyat süreçlerini koordine eder'),
        (N'Lojistik', N'Sevkiyat Operasyonları', N'Logistics Specialist', N'Lojistik operasyonlarını yürütür'),

        (N'AR-GE', N'Ürün Geliştirme', N'Product Development Specialist', N'Ürün geliştirme süreçlerini yürütür'),
        (N'AR-GE', N'Ürün Geliştirme', N'Development Engineer', N'Ürün geliştirme mühendisliği yapar'),

        (N'AR-GE', N'Araştırma', N'Research Engineer', N'Araştırma çalışmalarını yürütür'),
        (N'AR-GE', N'Araştırma', N'Research Specialist', N'Araştırma projelerini destekler'),

        (N'AR-GE', N'İnovasyon', N'Innovation Specialist', N'Yenilikçi fikir ve projeleri geliştirir'),
        (N'AR-GE', N'İnovasyon', N'Innovation Analyst', N'İnovasyon süreçlerini analiz eder'),

        (N'AR-GE', N'Prototipleme', N'Prototype Engineer', N'Prototip geliştirme süreçlerini yürütür'),
        (N'AR-GE', N'Prototipleme', N'Prototype Technician', N'Prototip üretim süreçlerini destekler'),

        (N'Ürün Yönetimi', N'Ürün Stratejisi', N'Product Manager', N'Ürün strateji ve süreçlerini yönetir'),
        (N'Ürün Yönetimi', N'Ürün Stratejisi', N'Senior Product Manager', N'Ürün stratejisini üst seviyede yönetir'),

        (N'Ürün Yönetimi', N'İş Analizi', N'Business Analyst', N'İş ihtiyaçlarını analiz eder'),
        (N'Ürün Yönetimi', N'İş Analizi', N'System Analyst', N'Sistem gereksinimlerini analiz eder'),

        (N'Ürün Yönetimi', N'Ürün Geliştirme Koordinasyonu', N'Product Owner', N'Ürün gereksinimlerini ve backlogu yönetir'),
        (N'Ürün Yönetimi', N'Ürün Geliştirme Koordinasyonu', N'Product Coordinator', N'Ürün geliştirme süreçlerini koordine eder'),

        (N'Ürün Yönetimi', N'Kullanıcı Deneyimi', N'UX Researcher', N'Kullanıcı deneyimi araştırmaları yapar'),
        (N'Ürün Yönetimi', N'Kullanıcı Deneyimi', N'UX Designer', N'Kullanıcı deneyimi tasarımı yapar'),

        (N'Kalite Yönetimi', N'Kalite Güvence', N'Quality Assurance Specialist', N'Kalite güvence süreçlerini yürütür'),
        (N'Kalite Yönetimi', N'Kalite Güvence', N'QA Engineer', N'Test ve kalite süreçlerini yürütür'),

        (N'Kalite Yönetimi', N'Kalite Kontrol', N'Quality Control Analyst', N'Kalite kontrol analizlerini yapar'),
        (N'Kalite Yönetimi', N'Kalite Kontrol', N'Quality Inspector', N'Kalite kontrol denetimlerini yapar'),

        (N'Kalite Yönetimi', N'Süreç Kalitesi', N'Process Quality Engineer', N'Süreç kalite geliştirme çalışmalarını yürütür'),
        (N'Kalite Yönetimi', N'Süreç Kalitesi', N'Continuous Improvement Specialist', N'Sürekli iyileştirme süreçlerini yürütür'),

        (N'Eğitim ve Gelişim', N'Kurumsal Eğitim', N'Training Specialist', N'Kurumsal eğitim programlarını planlar ve uygular'),
        (N'Eğitim ve Gelişim', N'Kurumsal Eğitim', N'Corporate Trainer', N'Kurumsal eğitimleri verir'),

        (N'Eğitim ve Gelişim', N'Teknik Eğitim', N'Technical Trainer', N'Teknik eğitim süreçlerini yürütür'),
        (N'Eğitim ve Gelişim', N'Teknik Eğitim', N'Technical Learning Specialist', N'Teknik öğrenme programlarını tasarlar'),

        (N'Eğitim ve Gelişim', N'Kariyer Gelişimi', N'Career Development Advisor', N'Kariyer gelişim süreçlerini destekler'),
        (N'Eğitim ve Gelişim', N'Kariyer Gelişimi', N'Mentoring Specialist', N'Mentorluk ve gelişim süreçlerini yönetir')
) AS p(department_name, sub_department_name, position_name, position_description)
              ON LTRIM(RTRIM(d.name)) = LTRIM(RTRIM(p.department_name))
                  AND LTRIM(RTRIM(sd.name)) = LTRIM(RTRIM(p.sub_department_name))
WHERE NOT EXISTS (
    SELECT 1
    FROM department_positions dp
    WHERE dp.sub_department_id = sd.id
      AND LTRIM(RTRIM(dp.name)) = LTRIM(RTRIM(p.position_name))
);