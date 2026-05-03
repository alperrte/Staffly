-- Seed example transport routes (V92)
-- İzleme/örnek veritabanı için birkaç servis hattı ekler.

INSERT INTO transport_routes (route_code, route_name, description, origin_area, destination_area, service_areas, capacity, active)
VALUES
  (N'GBD-01', N'Gebze - Darıca - Şekerpınar', N'Gebze merkezden Darıca ve Şekerpınar sanayi bölgesine giden servis hattı', N'Gebze Merkez', N'Şekerpınar', N'["Gebze Merkez","Darıca Merkez","Şekerpınar Sanayi"]', 40, 1),
  (N'GBD-02', N'Gebze - Şekerpınar (Ring)', N'Gebze körfez hattı, Şekerpınar ring servis', N'Gebze Merkez', N'Çayırova/Şekerpınar', N'["Gebze Merkez","Çayırova","Şekerpınar"]', 30, 1),
  (N'GBH-01', N'Gebze - Sabiha Gökçen (Havalimanı)', N'Gebze ve Darıca üzerinden Sabiha Gökçen Havalimanına direkt servis', N'Gebze Otogar', N'Sabiha Gökçen Havalimanı', N'["Gebze Otogar","Darıca","Sabiha Gökçen Havalimanı"]', 50, 1),
  (N'KAV-01', N'Kavacık - Gebze', N'Kavacık bölgesinden Gebze istikametine servis', N'Kavacık', N'Gebze Merkez', N'["Kavacık","Beykoz","Gebze Merkez"]', 35, 1),
  (N'IST-01', N'İstanbul (Kavacık) - Şekerpınar', N'İstanbul yönünden Gebze/Şekerpınar hattı', N'Kavacık', N'Çayırova/Şekerpınar', N'["Kavacık","Kartal","Çayırova","Şekerpınar"]', 45, 1),
  (N'DAR-01', N'Darıca Local Shuttle', N'Darıca içinde kısa ring servis (test/yerel)', N'Darıca Merkez', N'Darıca Merkez', N'["Darıca Merkez","Körfez Yolu"]', 20, 1),
  (N'GBD-TEST-01', N'Test Route (inactive)', N'Test amaçlı devre dışı rota', N'Gebze Merkez', N'Gebze Merkez', N'["Gebze Merkez"]', 10, 0),
  (N'GEB-MOR-01', N'Gebze Morning Express', N'Sabah yoğunluğu için ekspres hat', N'Gebze Merkez', N'Şekerpınar', N'["Gebze Merkez","Sabah Ekspres Durak"]', 55, 1);

-- Not: service_areas sütunu şu an NVARCHAR olarak JSON-benzeri string saklıyor.
-- Eğer ileride JSON tipi/ayrılmış tablo kullanılacaksa, buna göre migration güncellenecektir.
